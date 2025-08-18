import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import heLocale from '@fullcalendar/core/locales/he';
import { useAuth } from '../context/AuthContext'; // >>> 1. ייבוא useAuth
import '../App.css';

function SchedulePage() {
  const [events, setEvents] = useState([]);
  const [viewMode, setViewMode] = useState('all');
  const navigate = useNavigate();
  const { user, activeRole } = useAuth(); // >>> 2. קבלת התפקיד הפעיל

  useEffect(() => {
    let endpoint = '/api/meetings/public'; // ברירת מחדל: לוח זמנים ציבורי

    if (viewMode === 'my' && activeRole) {
      // >>> 3. שימוש ב-activeRole כדי לבנות את הכתובת הנכונה <<<
      endpoint = `/api/meetings?role=${activeRole}`;
    }

    fetch(endpoint) 
      .then(res => {
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) return [];
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(data => {
        const formattedEvents = (data || []).map(item => ({
            ...item,
            title: item.name,
            backgroundColor: viewMode === 'my' ? 'var(--secondary-color)' : 'var(--primary-color)',
            borderColor: viewMode === 'my' ? 'var(--secondary-color)' : 'var(--primary-color)',
        }));
        setEvents(formattedEvents);
      })
      .catch(error => console.error("There was a problem fetching the schedule:", error));
  }, [viewMode, activeRole]); // הוספנו את activeRole כתלות

  const handleDateClick = (info) => {
    navigate(`/day/${info.dateStr}`);
  };

  // פונקציה שמחזירה את הטקסט הנכון לכפתור
  const getMyScheduleText = () => {
      if (activeRole === 'trainer') return 'השיעורים שלי כמאמן';
      if (activeRole === 'member') return 'השיעורים שלי כמתאמן';
      return 'השיעורים שלי';
  }

  return (
    <div className="container">
      <div className="schedule-header">
        <h2>לוח שיעורים</h2>
        {user && ( // הצג את המתג רק אם המשתמש מחובר
            <div className="view-toggle">
            <button 
                className={viewMode === 'all' ? 'active' : ''} 
                onClick={() => setViewMode('all')}
            >
                כל השיעורים
            </button>
            <button 
                className={viewMode === 'my' ? 'active' : ''} 
                onClick={() => setViewMode('my')}
            >
                {getMyScheduleText()}
            </button>
            </div>
        )}
      </div>
      
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={heLocale}
        events={events}
        timeZone='local'
        selectable={true}
        dateClick={handleDateClick}
        height="auto"
      />
    </div>
  );
}

export default SchedulePage;