import React from 'react';

function PastSessionsList({ sessions }) {
  if (!sessions || sessions.length === 0) {
    return <p>עדיין לא השתתפת באף שיעור. השיעור הראשון בדרך!</p>;
  }

  return (
    <ul className="simple-list">
      {sessions.map(session => (
        <li key={session.id}>
          <div>
            <span>{session.name}</span>
            {/* >>> התיקון כאן <<< */}
            <span style={{fontSize: '0.8rem', color: '#666', display: 'block'}}>
              עם {session.trainerName}
            </span>
          </div>
          <span className="list-date">{new Date(session.start).toLocaleDateString('he-IL')}</span>
        </li>
      ))}
    </ul>
  );
}

export default PastSessionsList;