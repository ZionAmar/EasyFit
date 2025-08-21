import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import heLocale from '@fullcalendar/core/locales/he';
import { useAuth } from '../context/AuthContext';
import api from '../services/api'; // <<< 1. ייבוא שירות ה-API
import BookingModal from '../components/BookingModal';
import '../App.css';

function SchedulePage() {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const { user, activeStudio, activeRole } = useAuth(); // <<< 2. קבלת activeStudio
    const navigate = useNavigate();

    useEffect(() => {
        const loadEvents = async () => {
            try {
                // <<< 3. קריאת API אחת פשוטה שמביאה את כל המידע הרלוונטי
                // השרת יחזיר את כל השיעורים בסטודיו, ויסמן את אלה שהמשתמש רשום אליהם
                const meetings = await api.get('/api/meetings');
                
                if (Array.isArray(meetings)) {
                    const formattedEvents = meetings.map(item => {
                        // בדיקה אם המשתמש רשום לשיעור (השרת מוסיף 'status' רק לשיעורים הרלוונטיים)
                        const isMyEvent = ['active', 'checked_in'].includes(item.status);
                        
                        // בתצוגת מאמן, כל השיעורים שלו הם "שלו"
                        const isTrainerEvent = activeRole === 'trainer';

                        return {
                            ...item,
                            title: `${item.name} ${activeRole !== 'trainer' ? `(${item.trainerName})` : ''}`,
                            backgroundColor: (isMyEvent || isTrainerEvent) ? 'var(--secondary-color)' : 'var(--primary-color)',
                            borderColor: (isMyEvent || isTrainerEvent) ? 'var(--secondary-color)' : 'var(--primary-color)',
                            extendedProps: { 
                                isMyEvent, 
                                trainerName: item.trainerName, 
                                roomName: item.roomName,
                                status: item.status // שמירת הסטטוס לשימוש במודאל
                            }
                        };
                    });
                    setEvents(formattedEvents);
                }
            } catch (error) {
                console.error("There was a problem fetching the schedule:", error);
                setEvents([]); // איפוס במקרה של שגיאה
            }
        };

        // <<< 4. הפעלת הפונקציה רק אם יש סטודיו פעיל
        if (activeStudio) {
            loadEvents();
        }
    }, [user, activeStudio, activeRole]); // הוספת התלויות הנכונות
  
    const handleEventClick = (clickInfo) => {
        setSelectedEvent({
            id: clickInfo.event.id,
            title: clickInfo.event.title,
            start: clickInfo.event.start,
            isMyEvent: clickInfo.event.extendedProps.isMyEvent,
            trainerName: clickInfo.event.extendedProps.trainerName,
            roomName: clickInfo.event.extendedProps.roomName,
            status: clickInfo.event.extendedProps.status
        });
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
                />
            )}
        </div>
    );
}

export default SchedulePage;
