import React from 'react';

function PastSessionsList({ sessions }) {
  if (!sessions || sessions.length === 0) {
    return <p>עדיין לא השתתפת באף שיעור. השיעור הראשון בדרך!</p>;
  }

  return (
    <ul className="simple-list">
      {sessions.map(session => (
        <li key={session.id}>
          <span>{session.name}</span>
          <span className="list-date">{new Date(session.date).toLocaleDateString('he-IL')}</span>
        </li>
      ))}
    </ul>
  );
}

export default PastSessionsList;