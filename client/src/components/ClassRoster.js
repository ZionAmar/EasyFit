import React from 'react';

function ClassRoster({ participants }) {
    if (!participants || participants.length === 0) {
        return <p>עדיין אין נרשמים לשיעור זה.</p>;
    }

    return (
        <ul className="simple-list roster-list">
            {participants.map(p => (
                <li key={p.id}>{p.full_name}</li>
            ))}
        </ul>
    );
}

export default ClassRoster;