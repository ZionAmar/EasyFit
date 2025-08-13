import React from 'react';

// רכיב זה מקבל 'session' ומציג את פרטיו
function UpcomingSessionCard({ session }) {

  const handleCancel = () => {
    // כאן תוסיף לוגיקה עתידית לביטול הרשמה
    alert(`ביטול שיעור ${session.name}`);
  };

  return (
    <div className="session-card">
      <h4>{session.name}</h4>
      <p><strong>תאריך:</strong> {new Date(session.date).toLocaleDateString('he-IL')}</p>
      <p><strong>שעה:</strong> {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}</p>
      {/* <p><strong>מאמן:</strong> {session.trainer_name}</p>  נצטרך לדאוג שהשרת ישלח גם את שם המאמן */}
      <button onClick={handleCancel}>בטל הרשמה</button>
    </div>
  );
}

export default UpcomingSessionCard;