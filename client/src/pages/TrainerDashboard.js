import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/ProfessionalTrainerDashboard.css';

const ParticipantRow = ({ participant, onCheckIn, isCheckInActive }) => (
    <div className={`participant-row ${participant.check_in_time ? 'checked-in' : ''}`}>
        <div className="participant-details">
            {participant.check_in_time && <span className="checkmark-icon">✓</span>}
            <span>{participant.full_name}</span>
        </div>
        <button 
            onClick={() => onCheckIn(participant.registrationId)}
            disabled={!!participant.check_in_time || !isCheckInActive}
            className="check-in-btn"
        >
            {participant.check_in_time ? 'בוצע צ׳ק-אין' : 'בצע צ׳ק-אין'}
        </button>
    </div>
);

const AgendaItem = ({ session }) => (
    <div className="agenda-item">
        <span className="agenda-time">{new Date(session.start).toTimeString().slice(0, 5)}</span>
        <span className="agenda-title">{session.name}</span>
        <span className="agenda-occupancy">{session.participant_count || 0}/{session.capacity}</span>
    </div>
);

const SessionDetailsModal = ({ session, onClose }) => {
    if (!session) return null;
    const formatTime = (date) => new Intl.DateTimeFormat('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(date));
    const formatDate = (date) => new Intl.DateTimeFormat('he-IL', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(date));
    const handleContentClick = (e) => e.stopPropagation();

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={handleContentClick}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                <h2>פרטי השיעור</h2>
                <h3>{session.name}</h3>
                <div className="modal-details">
                    <p><strong>תאריך:</strong> {formatDate(session.start)}</p>
                    <p><strong>שעה:</strong> {formatTime(session.start)} - {formatTime(session.end)}</p>
                    <p><strong>מיקום:</strong> חדר {session.roomName}</p>
                    <p><strong>סטטוס:</strong> {session.participant_count || 0} / {session.capacity} נרשמים</p>
                </div>
            </div>
        </div>
    );
};

function TrainerDashboard() {
    const { user, activeStudio } = useAuth();
    const navigate = useNavigate();
    
    const [mySchedule, setMySchedule] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const fetchSchedule = async () => {
        try {
            const data = await api.get('/api/meetings?viewAs=trainer'); 
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
            setMySchedule([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user && activeStudio) {
            fetchSchedule();
        } else {
            setIsLoading(false);
            setMySchedule([]);
        }
    }, [user, activeStudio]);

    const handleCheckIn = async (registrationId) => {
        try {
            await api.patch(`/api/participants/${registrationId}/check-in`, {});
            await fetchSchedule(); 
        } catch (error) {
            console.error('Check-in failed:', error);
            alert('שגיאה בעדכון סטטוס המתאמן.');
        }
    };
    
    const handleTrainerArrival = async (sessionId) => {
        try {
            await api.patch(`/api/meetings/${sessionId}/arrive`, {});
            alert('הגעתך אושרה. שיהיה שיעור מוצלח!');
            await fetchSchedule();
        } catch (error) {
            console.error('Error confirming arrival:', error);
            alert(`שגיאה באישור הגעה: ${error.message}`);
        }
    };

    const generateGoogleCalendarLink = (session) => {
        const formatDateForGoogle = (date) => date.toISOString().replace(/-|:|\.\d{3}/g, '');
        const startTime = formatDateForGoogle(session.start);
        const endTime = formatDateForGoogle(session.end);
        const details = `שיעור ${session.name} בסטודיו ${activeStudio?.studio_name || 'EasyFit'}.`;
        
        const url = new URL('https://www.google.com/calendar/render');
        url.searchParams.append('action', 'TEMPLATE');
        url.searchParams.append('text', `אימון: ${session.name}`);
        url.searchParams.append('dates', `${startTime}/${endTime}`);
        url.searchParams.append('details', details);
        url.searchParams.append('location', `${activeStudio?.studio_name || 'EasyFit'} - ${session.roomName}`);
        
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
    const pastSessions = mySchedule.filter(m => m.end < now).sort((a,b) => b.start - a.start);

    const tenMinutesBefore = nextSession ? new Date(nextSession.start.getTime() - 10 * 60 * 1000) : null;
    const isTrainerCheckInTime = nextSession && now >= tenMinutesBefore && now <= nextSession.end;
    const isSessionActive = nextSession && now >= nextSession.start && now <= nextSession.end;

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
                            <h2>{isTrainerCheckInTime ? "השיעור הנוכחי" : "השיעור הבא שלך"}</h2>
                        </div>
                        {nextSession ? (
                            <>
                                <p className="session-title">{nextSession.name}</p>
                                <p className="session-time">{new Intl.DateTimeFormat('he-IL', { weekday: 'long', hour: '2-digit', minute: '2-digit' }).format(nextSession.start)}</p>
                                <div className="session-actions trainer-actions">
                                    {isTrainerCheckInTime ? (
                                        <button 
                                            className={`btn-primary confirm-arrival ${nextSession.trainer_arrival_time ? 'is-confirmed' : ''}`} 
                                            onClick={() => handleTrainerArrival(nextSession.id)}
                                            disabled={!!nextSession.trainer_arrival_time}
                                        >
                                            {nextSession.trainer_arrival_time ? (
                                                <>
                                                    <span className="checkmark-icon">✓</span> הגעתך אושרה
                                                </>
                                            ) : (
                                                'אשר את הגעתך'
                                            )}
                                        </button>
                                    ) : (
                                        <>
                                            <button className="btn-secondary" onClick={() => handleAddToCalendar(nextSession)}>
                                                הוסף ליומן
                                            </button>
                                            <button className="btn-secondary details-btn" onClick={() => setIsDetailsModalOpen(true)}>
                                                פרטים
                                            </button>
                                        </>
                                    )}
                                </div>
                                <div className="roster-container">
                                    <h4>נרשמים ({nextSession.participants?.length || 0} / {nextSession.capacity})</h4>
                                    <div className="roster-list">
                                        {nextSession.participants && nextSession.participants.length > 0 ? (
                                            nextSession.participants.map(p => 
                                                <ParticipantRow 
                                                    key={p.registrationId || p.id} 
                                                    participant={p} 
                                                    onCheckIn={handleCheckIn} 
                                                    isCheckInActive={isSessionActive}
                                                />
                                            )
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
            {isDetailsModalOpen && nextSession && (
                <SessionDetailsModal session={nextSession} onClose={() => setIsDetailsModalOpen(false)} />
            )}
        </div>
    );
}

export default TrainerDashboard;