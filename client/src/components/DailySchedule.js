import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/DailySchedule.css'; 

const ScheduleRow = ({ session }) => (
    <div className="schedule-row">
        <span className="time">{session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}</span>
        <span className="session-name">{session.name}</span>
        <span className="trainer-name">{session.trainer_name}</span>
        <span className="room-name">{session.room_name}</span>
        <div className="occupancy-bar">
            <div 
                className="occupancy-fill" 
                style={{ width: `${(session.participant_count / session.capacity) * 100}%` }}
            ></div>
        </div>
        <span className="occupancy-text">
            {session.participant_count}/{session.capacity}
        </span>
    </div>
);

function DailySchedule() {
    const [schedule, setSchedule] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const data = await api.get('/api/studio/daily-schedule');
                setSchedule(data);
            } catch (error) {
                console.error("Failed to fetch daily schedule", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSchedule();
    }, []);

    if (isLoading) return <div className="loading">טוען לו"ז יומי...</div>;

    return (
        <div className="daily-schedule-widget card">
            <h3>הלו"ז להיום</h3>
            {schedule.length === 0 ? (
                <p className="empty-state">אין שיעורים מתוכננים להיום.</p>
            ) : (
                <>
                    <div className="schedule-header">
                        <span>שעה</span>
                        <span>שיעור</span>
                        <span>מאמן/ה</span>
                        <span>חדר</span>
                        <span style={{gridColumn: '5 / 7'}}>תפוסה</span>
                    </div>
                    <div className="schedule-body">
                        {schedule.map(session => <ScheduleRow key={session.id} session={session} />)}
                    </div>
                </>
            )}
        </div>
    );
}

export default DailySchedule;