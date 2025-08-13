import React from 'react';

// רכיב זה מקבל רשימה של שיעורים ומציג אותם
function WaitingListStatus({ list }) {
  if (list.length === 0) {
    return <p>אתה לא רשום לאף רשימת המתנה.</p>;
  }

  return (
    <div className="waiting-list">
      {list.map(session => (
        <div key={session.id} className="waiting-list-item">
          <span>{session.name}</span>
          <span>({new Date(session.date).toLocaleDateString('he-IL')})</span>
        </div>
      ))}
    </div>
  );
}

export default WaitingListStatus;