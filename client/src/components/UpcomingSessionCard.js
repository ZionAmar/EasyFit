import React from 'react';

function UpcomingSessionCard({ session }) {

  const handleCancel = () => {
    // כאן תוסיף לוגיקה עתידית לביטול הרשמה
    alert(`ביטול שיעור ${session.name}`);
  };

  // בדיקה למקרה שה-prop לא הגיע תקין
  if (!session || !session.start) {
    return <p>טוען פרטי שיעור...</p>;
  }

  return (
    <div className="session-card">
      <h4>{session.name}</h4>
      
      {/* >>> התיקון כאן: משתמשים בשדה 'start' ו-'end' <<< */}
      <p><strong>תאריך:</strong> {session.start.toLocaleDateString('he-IL')}</p>
      <p>
        <strong>שעה:</strong> 
        {` ${session.start.toTimeString().slice(0, 5)} - ${session.end.toTimeString().slice(0, 5)}`}
      </p>
      
      <button onClick={handleCancel}>בטל הרשמה</button>
    </div>
  );
}

export default UpcomingSessionCard;