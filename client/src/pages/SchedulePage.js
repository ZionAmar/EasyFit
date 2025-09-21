import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import heLocale from '@fullcalendar/core/locales/he';
import { useAuth } from '../context/AuthContext';
import api from '../services/api'; 
import BookingModal from '../components/BookingModal';
import '../App.css';

function SchedulePage() {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const { user, activeStudio, activeRole } = useAuth(); 
    const navigate = useNavigate();

    const fetchEvents = async () => {
        if (!activeStudio) return;

        try {
            let meetings = [];
            let myMeetingMap = new Map();

            if (activeRole === 'trainer') {
                meetings = await api.get('/api/meetings');
                meetings.forEach(m => myMeetingMap.set(m.id, m.status));
            } else {
                meetings = await api.get(`/api/meetings/public?studioId=${activeStudio.studio_id}`);
                
                if (user) {
                    const myMeetings = await api.get('/api/meetings');
                    myMeetings.forEach(m => myMeetingMap.set(m.id, m.status));
                }
            }
            
            if (Array.isArray(meetings)) {
                const formattedEvents = meetings.map(item => {
                    const userStatus = myMeetingMap.get(item.id);
                    const isRegistered = Boolean(userStatus);
                    
                    let eventTitle = item.name;
                    if (activeRole !== 'trainer') {
                        eventTitle += ` (${item.trainerName})`;
                    }
                    if (userStatus === 'waiting') {
                        eventTitle += ' (בהמתנה)';
                    } else if (userStatus === 'pending') {
                        eventTitle += ' (ממתין לאישור)';
                    }

                    return {
                        ...item,
                        title: eventTitle,
                        backgroundColor: isRegistered ? 'var(--secondary-color)' : 'var(--primary-color)',
                        borderColor: isRegistered ? 'var(--secondary-color)' : 'var(--primary-color)',
                        extendedProps: { 
                            isMyEvent: userStatus === 'active' || userStatus === 'checked_in',
                            trainerName: item.trainerName, 
                            roomName: item.roomName,
                            status: userStatus 
                        }
                    };
                });
                setEvents(formattedEvents);
            }
        } catch (error) {
            console.error("There was a problem fetching the schedule:", error);
            setEvents([]); 
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [user, activeStudio, activeRole]);
  
    const handleEventClick = (clickInfo) => {
        setSelectedEvent({
            id: clickInfo.event.id,
            title: clickInfo.event.title,
            start: new Date(clickInfo.event.startStr), // Use startStr for accuracy
            isMyEvent: clickInfo.event.extendedProps.isMyEvent,
            trainerName: clickInfo.event.extendedProps.trainerName,
            roomName: clickInfo.event.extendedProps.roomName,
            status: clickInfo.event.extendedProps.status
        });
    };

    const handleModalSave = () => {
        setSelectedEvent(null);
        fetchEvents();
    };
    
    const handleCloseModal = () => setSelectedEvent(null);

    return (
        <div className="container">
            <div className="schedule-header">
                <h2>לוח שיעורים</h2>
            </div>
            
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale={heLocale}
                events={events}
                timeZone='local'
                eventClick={handleEventClick}
                height="auto"
            />

            {selectedEvent && (
                <BookingModal 
                    event={selectedEvent} 
                    onClose={handleCloseModal} 
                    onSave={handleModalSave}
                />
            )}
        </div>
    );
}

export default SchedulePage;