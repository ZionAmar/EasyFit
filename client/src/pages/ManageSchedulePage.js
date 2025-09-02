import React, { useState, useEffect, useRef } from 'react'; // <<< 1. ייבוא useRef
import { useLocation } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import heLocale from '@fullcalendar/core/locales/he';
import api from '../services/api';

function ManageSchedulePage() {
    const location = useLocation();
    const passedState = location.state;
    
    // <<< 2. יצירת 'ref' כדי שנוכל "לדבר" עם לוח השנה >>>
    const calendarRef = useRef(null);

    const [events, setEvents] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [selectedTrainer, setSelectedTrainer] = useState('all');

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [meetingsRes, trainersRes] = await Promise.all([
                    api.get('/api/meetings'),
                    api.get('/api/users?role=trainer')
                ]);
                if (Array.isArray(meetingsRes)) {
                    setEvents(meetingsRes.map(m => ({ ...m, title: m.name })));
                }
                if (Array.isArray(trainersRes)) {
                    setTrainers(trainersRes);
                }
            } catch (error) {
                console.error("Error loading schedule data:", error);
            }
        };
        loadInitialData();
    }, []);
    
    // <<< 3. שדרוג הפונקציה כך שתשנה את התצוגה >>>
    const handleDateClick = (arg) => {
        // אם יש לנו גישה ל-API של לוח השנה
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            // משנים את התצוגה לתצוגת יום ועוברים לתאריך שנלחץ
            calendarApi.changeView('timeGridDay', arg.dateStr);
        }
    };

    const handleEventClick = (clickInfo) => {
        alert("פתיחת מודאל לעריכת שיעור: " + clickInfo.event.title);
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
                    <button onClick={() => alert('פתיחת מודאל ליצירת שיעור חדש')}>
                        + הוסף שיעור
                    </button>
                </div>
            </div>
            
            <FullCalendar
                // <<< 4. חיבור ה-ref לרכיב >>>
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                initialView={passedState?.initialView || 'timeGridWeek'}
                initialDate={passedState?.initialDate || new Date()}
                locale={heLocale}
                events={filteredEvents}
                eventClick={handleEventClick}
                dateClick={handleDateClick}
                editable={true}
                droppable={true}
                height="auto"
            />
        </div>
    );
}

export default ManageSchedulePage;