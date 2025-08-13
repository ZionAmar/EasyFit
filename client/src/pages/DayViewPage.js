import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function DayViewPage() {
    const { date } = useParams();
    const navigate = useNavigate();
    const [meetings, setMeetings] = useState([]); // שימוש בשם meetings

    useEffect(() => {
        // קריאה ל-API הנכון עם פרמטר התאריך
        fetch(`http://localhost:4060/api/meetings?date=${date}`, { credentials: 'include' })            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch meetings');
                return res.json();
            })
            .then(data => setMeetings(data))
            .catch(console.error);
    }, [date]);

    const timeSlots = [];
    for (let h = 6; h <= 22; h++) {
        for (let m = 0; m < 60; m += 15) {
            const hour = h.toString().padStart(2, '0');
            const minute = m.toString().padStart(2, '0');
            timeSlots.push(`${hour}:${minute}`);
        }
    }

    // פונקציה חדשה שבודקת אם משבצת זמן נופלת בתוך מפגש קיים
    const findMeetingForSlot = (time) => {
        return meetings.find(meeting => {
            const startTime = meeting.start_time.slice(0, 5);
            const endTime = meeting.end_time.slice(0, 5);
            return time >= startTime && time < endTime;
        });
    };

    const formattedDate = new Date(date).toLocaleDateString('he-IL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>📅 {formattedDate}</h2>
            </div>

            <div style={styles.schedule}>
                {timeSlots.map((time, index) => {
                    const meeting = findMeetingForSlot(time);
                    const isMeetingStart = meeting && meeting.start_time.slice(0, 5) === time;
                    const showHourLabel = index % 4 === 0;

                    return (
                        <div
                            key={time}
                            style={{
                                ...styles.timeSlot,
                                backgroundColor: meeting ? '#e3f2fd' : 'rgba(255,255,255,0.9)',
                                borderBottom: (meeting && !isMeetingStart) ? '1px solid #e3f2fd' : '1px solid #f0f0f0',
                                cursor: meeting ? 'default' : 'pointer',
                            }}
                            onClick={() => {
                                if (!meeting) {
                                    navigate(`/new-appointment?date=${date}&time=${time}`);
                                }
                            }}
                        >
                            <div style={styles.timeLabel}>
                                {showHourLabel ? time : ''}
                            </div>
                            <div style={styles.appointment}>
                                {isMeetingStart ? meeting.name : <span>&nbsp;</span>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: 800,
        margin: '40px auto',
        padding: '0 16px',
        fontFamily: "'Segoe UI', sans-serif"
    },
    header: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        position: 'relative',
    },
    title: {
        fontSize: 26,
        fontWeight: 600,
    },
    schedule: {
        border: '1px solid #e0e0e0',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
    },
    timeSlot: {
        display: 'flex',
        alignItems: 'center',
        padding: '10px 12px',
        borderBottom: '1px solid #f0f0f0',
        transition: 'background 0.2s ease-in-out',
        minHeight: '45px',
    },
    timeLabel: {
        width: 70,
        fontWeight: 500,
        color: '#333',
        fontSize: '14px',
    },
    appointment: {
        flex: 1,
        fontWeight: 'bold',
        color: '#1e88e5',
    },
};

export default DayViewPage;