import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function DayViewPage() {
  const { date } = useParams();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetch(`/api/appointments?date=${date}`)
      .then(res => res.json())
      .then(data => setAppointments(data))
      .catch(console.error);
  }, [date]);

  const timeSlots = [];
  for (let h = 6; h <= 22; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hour = h.toString().padStart(2, '0');
      const minute = m.toString().padStart(2, '0');
      timeSlots.push(`${hour}:${minute}`);
    }
  }

  const handleAdd = (time) => {
    const title = prompt("הזן כותרת לתור:");
    if (!title) return;

    fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date,
        hour: time,
        title,
        user_id: 1,
      })
    })
      .then(res => res.json())
      .then(() => {
        setAppointments(prev => [...prev, { start_time: `${date}T${time}`, title }]);
      });
  };

  const getAppointment = (time) => {
    return appointments.find(a => a.start_time.includes(time));
  };

  const formattedDate = new Date(date).toLocaleDateString('he-IL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>📅 {formattedDate}</h2>
      </div>

      <div style={styles.schedule}>
      {timeSlots.map((time, index) => {
        const appt = getAppointment(time);
        const showHourLabel = index % 4 === 0; // כל 4 רבעים מציגים שעה
      
        return (
          <div
            key={time}
            style={{
              ...styles.timeSlot,
              backgroundColor: appt ? '#f0f4ff' : 'rgba(255,255,255,0.9)',
              cursor: appt ? 'default' : 'pointer',
            }}
            onClick={() => {
              if (!appt) {
                navigate(`/new-appointment?date=${date}&time=${time}`);
              }
            }}
            
          >
            <div style={styles.timeLabel}>
              {showHourLabel ? time.slice(0, 5) : ''}
            </div>
            <div style={styles.appointment}>
              {appt ? appt.title : <span style={{ color: '#bbb' }}>  </span>}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 1200,
    margin: '40px auto',
    padding: '0 16px',
    fontFamily: "'Segoe UI', sans-serif"
  },
  header: {
    display: 'flex',
    justifyContent: 'center', // מרכז את הכותרת
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative', // נדרש כדי למקם את כפתור החזרה
  },
  title: {
    fontSize: 26,
    fontWeight: 600,
  },
  schedule: {
    border: '1px solid #e0e0e0',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
  },
  timeSlot: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 12px',
    borderBottom: '1px solid #f0f0f0',
    transition: 'background 0.2s ease-in-out',
  },
  timeLabel: {
    width: 70,
    fontWeight: 500,
    color: '#333',
  },
  appointment: {
    flex: 1,
  },
};

export default DayViewPage;
