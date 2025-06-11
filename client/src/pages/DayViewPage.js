import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function DayViewPage() {
  const { date } = useParams();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    // טעינת תורים מהשרת לתאריך שנבחר
    fetch(`/api/appointments?date=${date}`)
      .then(res => res.json())
      .then(data => setAppointments(data))
      .catch(err => console.error(err));
  }, [date]);

  const hours = Array.from({ length: 12 }, (_, i) => (8 + i).toString().padStart(2, '0') + ':00');

  const handleAdd = (hour) => {
    const title = prompt("כותרת התור:");
    if (!title) return;

    fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date,
        hour,
        title,
        user_id: 1 // אם אתה שומר מזהה משתמש
      })
    })
    .then(res => res.json())
    .then(() => {
      setAppointments(prev => [...prev, { start_time: `${date}T${hour}`, title }]);
    });
  };

  return (
    <div className="container">
      <h2 style={{ textAlign: 'center' }}>לוח זמנים ל־{date}</h2>

      <div className="day-schedule">
        {hours.map((hour) => {
          const appointment = appointments.find(a => a.start_time.includes(hour));
          return (
            <div key={hour} className="hour-block" onClick={() => !appointment && handleAdd(hour)}>
              <span>{hour}</span>
              <span>
                {appointment ? appointment.title : <span style={{ color: '#aaa' }}>פנוי – לחץ לקביעת תור</span>}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DayViewPage;
