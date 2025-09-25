import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import heLocale from '@fullcalendar/core/locales/he';
import api from '../services/api';
import BookingModal from '../components/BookingModal';
import '../App.css';

function SchedulePage() {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const { user, activeStudio, activeRole } = useAuth();

    const fetchEvents = useCallback(async () => {
        if (!activeStudio) return;

        try {
            let publicMeetings = [];
            // שלב 1: שלוף תמיד את כל השיעורים הציבוריים העתידיים
            publicMeetings = await api.get(`/api/meetings/public?studioId=${activeStudio.studio_id}`);
            
            // צור מפה של כל השיעורים לפי ID לגישה מהירה
            const meetingsMap = new Map(publicMeetings.map(m => [m.id, m]));

            // שלב 2: אם המשתמש מחובר, שלוף את כל השיעורים הספציפיים שלו
            if (user) {
                const myMeetings = await api.get(`/api/meetings?viewAs=${activeRole}`);
                
                // שלב 3: עדכן את המפה עם המידע האישי של המשתמש
                // זה יבטיח שהסטטוס האישי (רשום/בהמתנה) תמיד ידרוס את המידע הציבורי
                myMeetings.forEach(myMeeting => {
                    meetingsMap.set(myMeeting.id, myMeeting);
                });
            }

            const allMeetings = Array.from(meetingsMap.values());
            
            if (Array.isArray(allMeetings)) {
                const formattedEvents = allMeetings.map(item => {
                    const userStatus = item.status;
                    const isRegistered = Boolean(userStatus);
                    
                    let eventTitle = item.name;
                    if (activeRole !== 'trainer' && item.trainerName) {
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
    }, [user, activeStudio, activeRole]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);
  
    const handleEventClick = (clickInfo) => {
        setSelectedEvent({
            id: clickInfo.event.id,
            title: clickInfo.event.title,
            start: new Date(clickInfo.event.startStr),
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