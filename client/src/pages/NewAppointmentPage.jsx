import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function NewAppointmentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const date = queryParams.get('date');
  const time = queryParams.get('time');

  const [title, setTitle] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return;

    await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date,
        hour: time,
        title,
        user_id: 1,
      })
    });

    navigate(`/day/${date}`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>קביעת תור ל־{date} בשעה {time}</h2>
        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="text"
            placeholder="הכנס כותרת לתור"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button type="submit" style={styles.button}>שמור תור</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    background: 'linear-gradient(to bottom right, #e6f0ff, #ffffff)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    direction: 'rtl',
    fontFamily: "'Segoe UI', sans-serif"
  },
  card: {
    background: 'white',
    padding: 32,
    borderRadius: 12,
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: 400,
  },
  heading: {
    fontSize: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    border: '1px solid #ccc',
    fontSize: 16,
  },
  button: {
    width: '100%',
    padding: 12,
    background: '#4a90e2',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontSize: 16,
    cursor: 'pointer',
  }
};

export default NewAppointmentPage;
