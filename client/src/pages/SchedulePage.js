import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import heLocale from '@fullcalendar/core/locales/he';
import { useAuth } from '../context/AuthContext';
import BookingModal from '../components/BookingModal';
import '../App.css';

function SchedulePage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { user, activeRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadEvents = async () => {
      try {
        if (activeRole === 'trainer') {
          const res = await fetch(`/api/meetings?role=trainer`);
          const trainerMeetings = await res.json();
          const formattedEvents = (trainerMeetings || []).map(item => ({
            ...item,
            title: `${item.name}`,
            backgroundColor: 'var(--secondary-color)',
            borderColor: 'var(--secondary-color)',
            extendedProps: { trainerName: item.trainerName, roomName: item.roomName }
          }));
          setEvents(formattedEvents);
        } else {
          const [publicRes, myMeetingsRes] = await Promise.all([
            fetch('/api/meetings/public'),
            user ? fetch('/api/meetings?role=member') : Promise.resolve(null)
          ]);

          const publicMeetings = await publicRes.json();
          const myMeetings = myMeetingsRes && myMeetingsRes.ok ? await myMeetingsRes.json() : [];
          
          const allMeetingsMap = new Map();
          (publicMeetings || []).forEach(meeting => allMeetingsMap.set(meeting.id, meeting));
          (myMeetings || []).forEach(meeting => allMeetingsMap.set(meeting.id, meeting));
          
          const allMeetings = Array.from(allMeetingsMap.values());
          const myMeetingIds = new Set(myMeetings.map(m => m.id));

          const formattedEvents = allMeetings.map(item => {
            const isMyEvent = myMeetingIds.has(item.id);
            return {
              ...item,
              title: `${item.name} (${item.trainerName})`,
              backgroundColor: isMyEvent ? 'var(--secondary-color)' : 'var(--primary-color)',
              borderColor: isMyEvent ? 'var(--secondary-color)' : 'var(--primary-color)',
              extendedProps: { isMyEvent, trainerName: item.trainerName, roomName: item.roomName }
            }
          });
          setEvents(formattedEvents);
        }
      } catch (error) {
        console.error("There was a problem fetching the schedule:", error);
      }
    };

    if (user === null || activeRole) {
        loadEvents();
    }
  }, [user, activeRole]);
  
  const handleEventClick = (clickInfo) => {
    setSelectedEvent({
        id: clickInfo.event.id,
        title: clickInfo.event.title,
        start: clickInfo.event.start,
        isMyEvent: clickInfo.event.extendedProps.isMyEvent,
        trainerName: clickInfo.event.extendedProps.trainerName,
        roomName: clickInfo.event.extendedProps.roomName
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