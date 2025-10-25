import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import heLocale from '@fullcalendar/core/locales/he';
import api from '../services/api';
import MeetingModal from '../components/MeetingModal';
import '../styles/FullCalendar.css';

function ManageSchedulePage() {
    const location = useLocation();
    const passedState = location.state;
    const calendarRef = useRef(null);

    const [events, setEvents] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [selectedTrainer, setSelectedTrainer] = useState('all');
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [modalInitialData, setModalInitialData] = useState(null);
    const [operatingHours, setOperatingHours] = useState([]);
    const [businessHours, setBusinessHours] = useState([]);
    const [viewMinTime, setViewMinTime] = useState('00:00:00');
    const [viewMaxTime, setViewMaxTime] = useState('24:00:00');

    const fetchEvents = async () => {
        try {
            const meetingsRes = await api.get('/api/meetings');
            if (Array.isArray(meetingsRes)) {
                setEvents(meetingsRes.map(m => ({ ...m, title: m.name })));
            }
        } catch (error) {
            console.error("Error loading schedule data:", error);
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
            fetchEvents();
            try {
                const [trainersRes, settingsRes] = await Promise.all([
                    api.get('/api/users/all?role=trainer'),
                    api.get('/api/studio/settings')
                ]);

                if (Array.isArray(trainersRes)) {
                    setTrainers(trainersRes);
                }
                
                if (settingsRes && Array.isArray(settingsRes.hours)) {
                    const activeHours = settingsRes.hours.filter(h => h.open_time !== h.close_time);
                    setOperatingHours(activeHours); 

                    const calendarHours = activeHours.map(h => ({
                        daysOfWeek: [ (h.day_of_week === 0 ? 6 : h.day_of_week - 1) ],
                        startTime: h.open_time,
                        endTime: h.close_time
                    }));
                    setBusinessHours(calendarHours);

                    if (activeHours.length > 0) {
                        const earliest = activeHours.reduce((min, h) => h.open_time < min ? h.open_time : min, '24:00:00');
                        const latest = activeHours.reduce((max, h) => h.close_time > max ? h.close_time : max, '00:00:00');
                        setViewMinTime(earliest);
                        setViewMaxTime(latest);
                    }
                }
            } catch (error) {
                console.error("Error loading initial data:", error);
            }
        };
        loadInitialData();
    }, []);
    
    const handleDateClick = (arg) => {
        if (!calendarRef.current) return;
        const calendarApi = calendarRef.current.getApi();
        const currentView = calendarApi.view.type;

        if (currentView === 'dayGridMonth') {
            calendarApi.changeView('timeGridDay', arg.dateStr);
            return;
        }
        
        const clickedDate = arg.date;
        const clickedDay = clickedDate.getDay(); 
        const hoursForDay = businessHours.find(bh => bh.daysOfWeek.includes(clickedDay));

        if (!hoursForDay) {
            return;
        }

        const clickedTime = clickedDate.toTimeString().slice(0, 8);
        if (clickedTime < hoursForDay.startTime || clickedTime >= hoursForDay.endTime) {
            return; 
        }

        const [hour, minute] = clickedDate.toTimeString().split(':');
        setModalInitialData({
            date: arg.dateStr.split('T')[0],
            start_time: `${hour}:${minute}`
        });
    };
    
    const handleDatesSet = (dateInfo) => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            if (dateInfo.view.type === 'timeGridDay') {
                const currentDay = dateInfo.view.currentStart.getDay();
                const dayHours = businessHours.find(bh => bh.daysOfWeek.includes(currentDay));
                
                if (dayHours) {
                    calendarApi.setOption('slotMinTime', dayHours.startTime);
                    calendarApi.setOption('slotMaxTime', dayHours.endTime);
                } else {
                    calendarApi.setOption('slotMinTime', '08:00:00');
                    calendarApi.setOption('slotMaxTime', '20:00:00');
                }
            } else {
                calendarApi.setOption('slotMinTime', viewMinTime);
                calendarApi.setOption('slotMaxTime', viewMaxTime);
            }
        }
    };

    const handleEventClick = (clickInfo) => {
        setSelectedMeeting({ id: clickInfo.event.id });
    };
    
    const handleModalClose = () => {
        setSelectedMeeting(null);
        setModalInitialData(null);
    };

    const handleModalSave = () => {
        handleModalClose();
        fetchEvents();
    };

    const filteredEvents = events.filter(event => 
        selectedTrainer === 'all' || event.trainer_id == selectedTrainer
    );

    return (
        <div className="container"> 
            <div className="schedule-header">
                <h2>ניהול לוח שנה</h2>
                <div className="schedule-filters">
                    <select value={selectedTrainer} onChange={(e) => setSelectedTrainer(e.target.value)}>
                        <option value="all">כל המאמנים</option>
                        {trainers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                    </select>
                </div>
            </div>
            
            <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                initialView={'dayGridMonth'}
                locale={heLocale}
                events={filteredEvents}
                eventClick={handleEventClick}
                dateClick={handleDateClick}
                datesSet={handleDatesSet}
                editable={true}
                dayMaxEvents={true} 
                businessHours={businessHours}
                selectConstraint="businessHours"
            />

            {(selectedMeeting || modalInitialData) && (
                <MeetingModal
                    meeting={selectedMeeting}
                    initialData={modalInitialData}
                    operatingHours={operatingHours}
                    trainers={trainers}
                    onClose={handleModalClose}
                    onSave={handleModalSave}
                />
            )}
        </div>
    );
}

export default ManageSchedulePage;