import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // ודא שהנתיב נכון
import '../styles/ProfessionalTrainerDashboard.css'; // ודא שהנתיב נכון

const ParticipantRow = ({ participant, onCheckIn, isCheckInActive }) => (
    <div className={`participant-row ${participant.check_in_time ? 'checked-in' : ''}`}>
        <div className="participant-details">
            {/* --- תוספת: אייקון V יופיע כאן --- */}
            {participant.check_in_time && <span className="checkmark-icon">✓</span>}
            <span>{participant.full_name}</span>
        </div>
        <button 
            onClick={() => onCheckIn(participant.registrationId, participant.status)}
            disabled={!!participant.check_in_time || !isCheckInActive}
            className="check-in-btn"
        >
            {participant.check_in_time ? 'בוצע צ׳ק-אין' : 'בצע צ׳ק-אין'}
        </button>
    </div>
);

// --- רכיב עזר: פריט בלו"ז היומי ---
const AgendaItem = ({ session }) => (
    <div className="agenda-item">
        <span className="agenda-time">{new Date(session.start).toTimeString().slice(0, 5)}</span>
        <span className="agenda-title">{session.name}</span>
        <span className="agenda-occupancy">{session.participant_count || 0}/{session.capacity}</span>
    </div>
);

// --- רכיב עזר: מודאל פרטי שיעור ---
const SessionDetailsModal = ({ session, onClose }) => {
    if (!session) return null;

    const formatTime = (date) => new Intl.DateTimeFormat('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(date));
    const formatDate = (date) => new Intl.DateTimeFormat('he-IL', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(date));
    
    // מונע סגירה של המודאל בלחיצה על התוכן שלו
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


// --- רכיב הדשבורד הראשי ---
function ProfessionalTrainerDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [mySchedule, setMySchedule] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

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

    useEffect(() => {
        if (user) {
            fetchSchedule();
        }
    }, [user]);

    const handleCheckIn = async (registrationId, currentStatus) => {
        try {
            const response = await fetch(`/api/participants/${registrationId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                // שינוי: אנחנו כבר לא צריכים לשלוח את הסטטוס בגוף הבקשה
                body: JSON.stringify({}) 
            });

            if (!response.ok) {
                throw new Error('Failed to update check-in status');
            }

            // עדכון המצב המקומי עם הזמן הנוכחי
            setMySchedule(currentSchedule =>
                currentSchedule.map(session => ({
                    ...session,
                    participants: session.participants.map(p =>
                        p.registrationId === registrationId
                            ? { ...p, check_in_time: new Date().toISOString() } // <-- עדכון השדה הנכון
                            : p
                    )
                }))
            );

        } catch (error) {
            console.error('Check-in failed:', error);
            alert('שגיאה בעדכון סטטוס המתאמן.');
        }
    };
    
    const handleTrainerArrival = async (sessionId) => {
        try {
            const response = await fetch(`/api/meetings/${sessionId}/arrive`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to confirm arrival');
            }

            // עדכון המצב המקומי כדי שהשינוי ייראה מיידית
            setMySchedule(currentSchedule =>
                currentSchedule.map(session =>
                    session.id === sessionId
                        ? { ...session, trainer_arrival_time: new Date().toISOString() } // הוספת הזמן הנוכחי
                        : session
                )
            );

            alert('הגעתך אושרה. שיהיה שיעור מוצלח!');

        } catch (error) {
            console.error('Error confirming arrival:', error);
            alert(`שגיאה באישור הגעה: ${error.message}`);
        }
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
                                        // --- הכפתור המעודכן ---
                                        <button 
                                            className="btn-primary confirm-arrival" 
                                            onClick={() => handleTrainerArrival(nextSession.id)}
                                            disabled={!!nextSession.trainer_arrival_time}
                                        >
                                            {nextSession.trainer_arrival_time ? 'הגעתך אושרה' : 'אשר את הגעתך'}
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

export default ProfessionalTrainerDashboard;