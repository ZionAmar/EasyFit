import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import heLocale from '@fullcalendar/core/locales/he';
import api from '../services/api'; 
import BookingModal from '../components/BookingModal';
import TrainerViewModal from '../components/TrainerViewModal'; 
import '../styles/FullCalendar.css';

function SchedulePage() {
    const [events, setEvents] = useState([]);
    const [selectedEventForBooking, setSelectedEventForBooking] = useState(null);
    const [selectedMeetingIdForTrainer, setSelectedMeetingIdForTrainer] = useState(null);
    const { user, activeStudio, activeRole } = useAuth(); 

    const fetchEvents = useCallback(async () => {
        if (!activeStudio) return;
        try {
            let meetingsToDisplay = [];
        
            if (activeRole === 'trainer') {
                meetingsToDisplay = await api.get(`/api/meetings?viewAs=trainer`);
            } else {
                const publicMeetings = await api.get(`/api/meetings/public?studioId=${activeStudio.studio_id}`);
                const meetingsMap = new Map(publicMeetings.map(m => [m.id, m]));
            
                if (user) { 
                    const myMeetings = await api.get(`/api/meetings?viewAs=${activeRole}`);
                    myMeetings.forEach(myMeeting => {
                        meetingsMap.set(myMeeting.id, myMeeting);
                    });
                }
                meetingsToDisplay = Array.from(meetingsMap.values());
            }
        
            if (Array.isArray(meetingsToDisplay)) {
                const formattedEvents = meetingsToDisplay.map(item => {
                    const userStatus = item.status;
                    const isRegistered = Boolean(userStatus);
                    let eventTitle = item.name;
                    
                    if (activeRole !== 'trainer' && item.trainerName) {
                        eventTitle += ` (${item.trainerName})`;
                    }
                
                    if (userStatus === 'waiting') eventTitle += ' (בהמתנה)';
                    else if (userStatus === 'pending') eventTitle += ' (ממתין לאישור)';
                
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
        if (activeRole === 'trainer') {
            setSelectedMeetingIdForTrainer(clickInfo.event.id);
        } else {
            setSelectedEventForBooking({
                id: clickInfo.event.id,
                title: clickInfo.event.title,
                start: new Date(clickInfo.event.startStr),
                isMyEvent: clickInfo.event.extendedProps.isMyEvent,
                trainerName: clickInfo.event.extendedProps.trainerName,
                roomName: clickInfo.event.extendedProps.roomName,
                status: clickInfo.event.extendedProps.status,
                registrationId: clickInfo.event.extendedProps.registrationId 
            });
        }
    };

    const handleModalSave = () => {
        setSelectedEventForBooking(null);
        setSelectedMeetingIdForTrainer(null);
        fetchEvents();
    };
    
    const handleCloseModal = () => {
        setSelectedEventForBooking(null);
        setSelectedMeetingIdForTrainer(null);
    };

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
                dayMaxEvents={true}
            />

            {selectedEventForBooking && (
                <BookingModal 
                    event={selectedEventForBooking} 
                    onClose={handleCloseModal} 
                    onSave={handleModalSave}
                />
            )}

            {selectedMeetingIdForTrainer && (
                <TrainerViewModal
                    meetingId={selectedMeetingIdForTrainer}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}

export default SchedulePage;