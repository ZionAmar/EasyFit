import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function DayViewPage() {
    const { date } = useParams();
    const navigate = useNavigate();
    const [meetings, setMeetings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch(`http://localhost:4060/api/meetings/public?date=${date}`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch meetings');
                return res.json();
            })
            .then(data => {
                const processedMeetings = (data || []).map(m => ({
                    ...m,
                    start: new Date(m.start),
                    end: new Date(m.end)
                }));
                setMeetings(processedMeetings);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, [date]);

    const timeSlots = [];
    for (let h = 6; h <= 22; h++) {
        for (let m = 0; m < 60; m += 15) {
            const slotDate = new Date(`${date}T${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`);
            timeSlots.push(slotDate);
        }
    }

    const findMeetingForSlot = (slotDate) => {
        return meetings.find(meeting => slotDate >= meeting.start && slotDate < meeting.end);
    };

    const formattedDate = new Date(date).toLocaleDateString('he-IL', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    if (isLoading) {
        return <div className="loading">טוען שיעורים...</div>
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button onClick={() => navigate('/schedule')} style={styles.backButton}>חזרה ללוח השנה</button>
                <h2 style={styles.title}>📅 {formattedDate}</h2>
            </div>

            <div style={styles.schedule}>
                {timeSlots.map((slotDate) => {
                    const timeString = slotDate.toTimeString().slice(0, 5);
                    const meeting = findMeetingForSlot(slotDate);
                    const isMeetingStart = meeting && meeting.start.getHours() === slotDate.getHours() && meeting.start.getMinutes() === slotDate.getMinutes();
                    const showHourLabel = slotDate.getMinutes() === 0;

                    return (
                        <div
                            key={timeString}
                            style={{
                                ...styles.timeSlot,
                                backgroundColor: meeting ? '#e3f2fd' : 'rgba(255,255,255,0.9)',
                                cursor: meeting ? 'default' : 'pointer',
                            }}
                            onClick={() => {
                                if (!meeting) {
                                    navigate(`/new-appointment?date=${date}&time=${timeString}`);
                                }
                            }}
                        >
                            <div style={styles.timeLabel}>
                                {showHourLabel ? timeString : ''}
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