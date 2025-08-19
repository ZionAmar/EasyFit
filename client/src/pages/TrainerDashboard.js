import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // ודא שהנתיב נכון
import '../styles/ProfessionalTrainerDashboard.css'; // ייבוא העיצוב החדש

// --- רכיבי עזר קטנים ---

const ParticipantRow = ({ participant, onCheckIn }) => (
    <div className={`participant-row ${participant.status === 'checked_in' ? 'checked-in' : ''}`}>
        <span>{participant.full_name}</span>
        <button 
            onClick={() => onCheckIn(participant.registrationId, participant.status)}
            disabled={participant.status === 'checked_in'}
            className="check-in-btn"
        >
            {participant.status === 'checked_in' ? 'בוצע צ׳ק-אין' : 'בצע צ׳ק-אין'}
        </button>
    </div>
);

const AgendaItem = ({ session }) => (
    <div className="agenda-item">
        <span className="agenda-time">{session.start.toTimeString().slice(0, 5)}</span>
        <span className="agenda-title">{session.name}</span>
        <span className="agenda-occupancy">{session.participant_count || 0}/{session.capacity}</span>
    </div>
);


// --- רכיב הדשבורד הראשי ---
function ProfessionalTrainerDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [mySchedule, setMySchedule] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const response = await fetch('/api/meetings?role=trainer');
                if (!response.ok) throw new Error('Failed to fetch schedule');
                const data = await response.json();

                if (Array.isArray(data)) {
                    const processed = data.map(m => ({
                        ...m,
                        start: new Date(m.start),
                        end: new Date(m.end)
                    })).sort((a, b) => a.start - b.start);
                    setMySchedule(processed);
                }
            } catch (error) {
                console.error("Error fetching trainer schedule:", error);
            } finally {
                setIsLoading(false);
            }
        };
        if (user) fetchSchedule();
    }, [user]);

    const handleCheckIn = (registrationId, currentStatus) => {
        const newStatus = currentStatus === 'checked_in' ? 'active' : 'checked_in';
        console.log(`Updating participant registration ${registrationId} to ${newStatus}`);
    };

    const handleTrainerArrival = (sessionId) => {
        console.log(`Trainer confirms arrival for session ID: ${sessionId}`);
        alert('הגעתך אושרה. שיהיה שיעור מוצלח!');
    };

    const generateGoogleCalendarLink = (session) => {
        const formatDateForGoogle = (date) => date.toISOString().replace(/-|:|\.\d{3}/g, '');
        const startTime = formatDateForGoogle(session.start);
        const endTime = formatDateForGoogle(session.end);
        const details = `שיעור ${session.name} בסטודיו EasyFit.`;
        
        const url = new URL('https://www.google.com/calendar/render');
        url.searchParams.append('action', 'TEMPLATE');
        url.searchParams.append('text', `אימון: ${session.name}`);
        url.searchParams.append('dates', `${startTime}/${endTime}`);
        url.searchParams.append('details', details);
        url.searchParams.append('location', `סטודיו EasyFit - ${session.roomName}`);
        
        return url.toString();
    };

    const handleAddToCalendar = (session) => {
        const link = generateGoogleCalendarLink(session);
        window.open(link, '_blank', 'noopener,noreferrer');
    };

    const now = new Date();
    const upcomingSessions = mySchedule.filter(m => m.end >= now);
    const nextSession = upcomingSessions.length > 0 ? upcomingSessions[0] : null;
    const todaysSessions = mySchedule.filter(m => m.start.toDateString() === now.toDateString());
    const pastSessions = mySchedule.filter(m => m.end < now).sort((a,b) => b.start - a.start); // סינון היסטוריה

    const tenMinutesBefore = nextSession ? new Date(nextSession.start.getTime() - 10 * 60 * 1000) : null;
    const isCheckInTime = nextSession && now >= tenMinutesBefore && now <= nextSession.end;

    if (isLoading) {
        return <div className="loading">טוען את לוח הזמנים שלך...</div>;
    }

    return (
        <div className="pro-dashboard trainer-view">
            <header className="dashboard-header-pro">
                <div className="header-text">
                    <h1>שלום, {user?.full_name || "מאמן"}!</h1>
                    <p>הנה מה שמצפה לך היום. שיהיה אימון מעולה!</p>
                </div>
                <button className="cta-button-pro secondary" onClick={() => navigate('/schedule')}>
                    לוח זמנים מלא
                </button>
            </header>

            <div className="dashboard-grid-pro">
                <main className="main-panel-pro">
                    <section className="card-pro next-session-card">
                        <div className="card-header">
                            <span className="card-icon">🎯</span>
                            <h2>{isCheckInTime ? "השיעור הנוכחי" : "השיעור הבא שלך"}</h2>
                        </div>
                        {nextSession ? (
                            <>
                                <p className="session-title">{nextSession.name}</p>
                                <p className="session-time">{new Intl.DateTimeFormat('he-IL', { weekday: 'long', hour: '2-digit', minute: '2-digit' }).format(nextSession.start)}</p>
                                
                                <div className="session-actions trainer-actions">
                                    {isCheckInTime ? (
                                        <button className="btn-primary confirm-arrival" onClick={() => handleTrainerArrival(nextSession.id)}>
                                            אשר את הגעתך
                                        </button>
                                    ) : (
                                        <button className="btn-secondary" onClick={() => handleAddToCalendar(nextSession)}>
                                            הוסף ליומן
                                        </button>
                                    )}
                                </div>

                                <div className="roster-container">
                                    <h4>נרשמים ({nextSession.participants?.length || 0} / {nextSession.capacity})</h4>
                                    <div className="roster-list">
                                        {nextSession.participants && nextSession.participants.length > 0 ? (
                                            nextSession.participants.map(p => <ParticipantRow key={p.id} participant={p} onCheckIn={handleCheckIn} />)
                                        ) : <p className="empty-state-small">אין עדיין נרשמים לשיעור זה.</p>}
                                    </div>
                                </div>

                                {nextSession.waitingList && nextSession.waitingList.length > 0 && (
                                    <div className="roster-container waiting-list">
                                        <h4>רשימת המתנה ({nextSession.waitingList.length})</h4>
                                        <div className="roster-list">
                                            {nextSession.waitingList.map(p => (
                                                <div key={p.id} className="participant-row waiting">
                                                    <span>{p.full_name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="placeholder-card">
                                <h4>אין לך שיעורים עתידיים בלו"ז.</h4>
                            </div>
                        )}
                    </section>
                </main>

                <aside className="side-panel-pro">
                    <section className="card-pro list-card">
                        <div className="card-header">
                            <span className="card-icon">📋</span>
                            <h2>הלו"ז להיום</h2>
                        </div>
                        {todaysSessions.length > 0 ? (
                            todaysSessions.map(s => <AgendaItem key={s.id} session={s} />)
                        ) : <p className="empty-state">סיימת להיום! 💪</p>}
                    </section>
                    
                    {/* --- חלונית היסטוריה חדשה --- */}
                    <section className="card-pro list-card">
                        <div className="card-header">
                            <span className="card-icon">📚</span>
                            <h2>שיעורים אחרונים</h2>
                        </div>
                        {pastSessions.length > 0 ? (
                            pastSessions.slice(0, 3).map(s => <AgendaItem key={s.id} session={s} />)
                        ) : <p className="empty-state">אין עדיין שיעורים שהושלמו.</p>}
                        <span className="see-all-link" onClick={() => navigate('/trainer-history')}>
                            הצג את כל ההיסטוריה →
                        </span>
                    </section>
                </aside>
            </div>
        </div>
    );
}

export default ProfessionalTrainerDashboard;
