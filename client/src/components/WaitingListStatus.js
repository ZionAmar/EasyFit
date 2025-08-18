import React from 'react';

// רכיב זה מקבל רשימה של שיעורים ומציג אותם
function WaitingListStatus({ list = [] }) {
  if (list.length === 0) {
    return <p>אתה לא רשום לאף רשימת המתנה.</p>;
  }

  return (
    <ul className="simple-list">
      {list.map(session => (
        <li key={session.id}>
          <span>{session.name}</span>
          {/* אנו משתמשים בשדה 'start' החדש והאמין */}
          <span className="list-date">({new Date(session.start).toLocaleDateString('he-IL')})</span>
        </li>
      ))}
    </ul>
  );
}

export default WaitingListStatus;