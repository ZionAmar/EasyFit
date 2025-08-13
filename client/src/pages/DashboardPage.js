import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import heLocale from '@fullcalendar/core/locales/he';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function DashboardPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentTitle, setCurrentTitle] = useState('');
  const [showDateInput, setShowDateInput] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const calendarRef = useRef(null);
  const dateInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/meetings`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Network response was not ok');
          }
          return res.json();
        })
        .then(data => {
          const formatted = data
            .filter(item => item.date)
            .map(item => {
              // התיקון האחרון והחשוב ביותר:
              // יצירת אובייקט Date במקום מחרוזת טקסט.
              // זה פותר באופן סופי בעיות אזור זמן.
              const eventDate = item.date.split('T')[0];
              const startString = `${eventDate}T${item.start_time}`;
              const endString = `${eventDate}T${item.end_time}`;

              return {
                id: item.id,
                title: item.name || 'אימון',
                start: new Date(startString),
                end: new Date(endString),
              };
            });
          setEvents(formatted);
        })
        .catch(error => {
          console.error("There was a problem fetching the meetings:", error);
        });
    }
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      setCurrentTitle(calendarApi.view.title);
    }
  }, [events, isMobile]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dateInputRef.current && !dateInputRef.current.contains(event.target)) {
        setShowDateInput(false);
      }
    };
    if (showDateInput) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDateInput]);

  const handleDateClick = (info) => {
    navigate(`/day/${info.dateStr}`);
  };

  const handleDateSelect = () => {
    if (selectedDate) {
      navigate(`/day/${selectedDate}`);
      setShowDateInput(false);
    }
  };

  const goToPrev = () => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.prev();
      setCurrentTitle(api.view.title);
    }
  };

  const goToNext = () => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.next();
      setCurrentTitle(api.view.title);
    }
  };

  const goToToday = () => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.today();
      setCurrentTitle(api.view.title);
    }
  };

  const dateInputElement = showDateInput && (
    <div
      ref={dateInputRef}
      style={{
        position: 'absolute',
        top: '42px',
        left: 0,
        zIndex: 999,
        padding: '12px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        style={{
          padding: '6px 10px',
          fontSize: '14px',
          borderRadius: '8px',
          border: '1px solid #ccc',
          direction: 'ltr',
        }}
      />
      <button onClick={handleDateSelect}>מעבר</button>
    </div>
  );

  return (
    <div className="container">
      <div className="custom-calendar-header">
        {isMobile ? (
          <>
            <div className="title-row">
              <h2>{currentTitle}</h2>
            </div>
            <div className="buttons-row mobile-layout">
              <div className="right-buttons">
                <button onClick={goToPrev}>➡️</button>
                <button onClick={goToToday}>היום</button>
                <button onClick={goToNext}>⬅️</button>
              </div>
              <div className="left-buttons" style={{ position: 'relative' }}>
                <button onClick={() => setShowDateInput(!showDateInput)}>📅 מעבר לתאריך</button>
                {dateInputElement}
              </div>
            </div>
          </>
        ) : (
          <div className="buttons-row desktop-layout">
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowDateInput(!showDateInput)}>📅 מעבר לתאריך</button>
              {dateInputElement}
            </div>
            <h2>{currentTitle}</h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={goToNext}>⬅️</button>
              <button onClick={goToToday}>היום</button>
              <button onClick={goToPrev}>➡️</button>
            </div>
          </div>
        )}
      </div>

      <FullCalendar
        key={isMobile ? 'mobile' : 'desktop'}
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={heLocale}
        events={events}
        // הוספנו את timeZone כדי לפתור בעיות אזור זמן
        timeZone='local'
        selectable={true}
        dateClick={handleDateClick}
        height="auto"
        headerToolbar={false}
        datesSet={(arg) => {
          if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            setCurrentTitle(calendarApi.view.title);
          }
        }}
      />
    </div>
  );
}

export default DashboardPage;