import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import heLocale from '@fullcalendar/core/locales/he';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function DashboardPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  const calendarRef = useRef();

  useEffect(() => {
    fetch(`/api/appointments?user_id=${user?.id}`)
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(item => ({
          id: item.id,
          title: item.title || 'אימון',
          start: item.start_time,
          end: item.end_time,
        }));
        setEvents(formatted);
      });
  }, [user]);

  const handleDateClick = (info) => {
    const dateStr = info.dateStr;
    navigate(`/day/${dateStr}`);
  };

  const handleGoToDate = () => {
    const input = prompt("הכנס תאריך (YYYY-MM-DD):");
    if (input && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
      navigate(`/day/${input}`); // ניווט לדף תצוגת היום
    } else {
      alert("פורמט לא תקין. השתמש ב-YYYY-MM-DD");
    }
  };

  return (
    <div className="container">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={heLocale}
        events={events}
        selectable={true}
        dateClick={handleDateClick}
        height="auto"
        headerToolbar={{
          left: 'goToDateButton',
          center: 'title',
          right: 'prev today next'
        }}
        customButtons={{
          goToDateButton: {
            text: 'מעבר לתאריך 📅',
            click: handleGoToDate
          }
        }}
      />
      
    </div>
  );
}

export default DashboardPage;
