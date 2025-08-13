import React from 'react';

function UpcomingSessionCard({ session }) {
  const handleCancel = () => {
    alert(`ביטול שיעור ${session.name}`);
  };

  return (
    <div className="session-card">
      <h4>{session.name}</h4>
      <p><strong>תאריך:</strong> {new Date(session.date).toLocaleDateString('he-IL')}</p>
      <p><strong>שעה:</strong> {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}</p>
      <button onClick={handleCancel}>בטל הרשמה</button>
    </div>
  );
}

export default UpcomingSessionCard;