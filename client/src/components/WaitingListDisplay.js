import React from 'react';

function WaitingListDisplay({ list = [], emptyMessage }) {
  // אם לא סופקה הודעה מותאמת, נשתמש בברירת מחדל כללית
  const finalEmptyMessage = emptyMessage || "אין נתונים להצגה.";

  if (list.length === 0) {
    return <p>{finalEmptyMessage}</p>;
  }

  return (
    <ul className="simple-list">
      {list.map(item => (
        // הקוד מטפל גם במשתתפים וגם בשיעורים
        <li key={item.id || item.name}>
          <span>{item.name || item.full_name}</span>
          {item.start && (
            <span className="list-date">({new Date(item.start).toLocaleDateString('he-IL')})</span>
          )}
        </li>
      ))}
    </ul>
  );
}

export default WaitingListDisplay;