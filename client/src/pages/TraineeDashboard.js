import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api'; 
import '../styles/ProfessionalDashboard.css';

const StatPill = ({ label, value, icon }) => (
    <div className="stat-pill">
        <span className="stat-icon">{icon}</span>
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
    </div>
);

const ListItem = ({ title, subtitle, status, statusType }) => (
    <div className="list-item">
        <div className="item-details">
            <span className="item-title">{title}</span>
            <span className="item-subtitle">{subtitle}</span>
        </div>
        {status && <span className={`status-badge ${statusType}`}>{status}</span>}
    </div>
);

const SessionDetailsModal = ({ session, isOpen, onClose, onCancel, showCancelButton }) => {
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.keyCode === 27) onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen || !session) return null;

    const formatFullDate = (date) => new Intl.DateTimeFormat('he-IL', { weekday: 'long', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit', hour12: false }).format(date);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose}>&times;</button>
                <h2>פרטי השיעור</h2>
                <h3>{session.name}</h3>
                <div className="modal-details-grid">
                    <p><strong>מאמן/ת:</strong> {session.trainerName}</p>
                    <p><strong>תאריך ושעה:</strong> {formatFullDate(session.start)}</p>
                    <p><strong>חדר:</strong> {session.roomName}</p>
                    <p><strong>משתתפים רשומים:</strong> {session.participant_count} / {session.capacity}</p>
                </div>
                {showCancelButton && (
                    <div className="modal-actions">
                        <button className="btn-tertiary" onClick={() => onCancel(session.registrationId, session.name)}>בטל הרשמה</button>
                    </div>
                )}
            </div>
        </div>
    );
};


function TraineeDashboard() {
    const { user, activeStudio } = useAuth();
    const navigate = useNavigate();
    
    const [myMeetings, setMyMeetings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);

    const fetchMeetings = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await api.get('/api/meetings'); 
            if (Array.isArray(data)) {
                const processedMeetings = data.map(m => ({ ...m, start: new Date(m.start), end: new Date(m.end) }));
                setMyMeetings(processedMeetings);
            } else {
                setMyMeetings([]);
            }
        } catch (err) {
            console.error("Error fetching meetings:", err);
            setError("לא הצלחנו לטעון את המידע. נסה לרענן את העמוד.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user && activeStudio) {
            fetchMeetings();
        } else {
            setIsLoading(false);
        }
    }, [user, activeStudio]);

    const handleCancel = async (registrationId, sessionName) => {
        if (window.confirm(`האם לבטל את הרשמתך לשיעור "${sessionName}"?`)) {
            try {
                await api.delete(`/api/participants/${registrationId}`);
                alert("ההרשמה בוטלה בהצלחה.");
                fetchMeetings();
                closeSessionDetails();
            } catch (err) {
                alert(`שגיאה בביטול ההרשמה: ${err.message}`);
            }
        }
    };

    const openSessionDetails = (session) => {
        setSelectedSession(session);
        setIsModalOpen(true);
    };
    const closeSessionDetails = () => setIsModalOpen(false);

    const generateGoogleCalendarLink = (session) => {
        const formatDateForGoogle = (date) => date.toISOString().replace(/-|:|\.\d{3}/g, '');
        const startTime = formatDateForGoogle(session.start);
        const endTime = formatDateForGoogle(session.end);
        const details = `שיעור ${session.name} עם ${session.trainerName}.`;
        
        const url = new URL('https://www.google.com/calendar/render');
        url.searchParams.append('action', 'TEMPLATE');
        url.searchParams.append('text', session.name);
        url.searchParams.append('dates', `${startTime}/${endTime}`);
        url.searchParams.append('details', details);
        url.searchParams.append('location', `סטודיו ${activeStudio?.studio_name || 'EasyFit'} - ${session.roomName}`);
        
        return url.toString();
    };
    
    const handleAddToCalendar = (session) => {
        const link = generateGoogleCalendarLink(session);
        window.open(link, '_blank', 'noopener,noreferrer');
    };

    const handleConfirmArrival = (sessionId) => {
        console.log(`Confirming arrival for session ID: ${sessionId}`);
        alert('הגעתך אושרה. אימון נעים!');
    };

    const now = new Date();
    
    const upcomingSessions = myMeetings.filter(m => m.end > now && m.status === 'active').sort((a, b) => a.start - b.start);
    const nextSession = upcomingSessions.length > 0 ? upcomingSessions[0] : null;
    const waitingList = myMeetings.filter(m => m.status === 'waiting' || m.status === 'pending').sort((a, b) => a.start - b.start);
    const pastSessions = myMeetings.filter(m => m.end < now && ['active', 'checked_in'].includes(m.status)).sort((a, b) => b.start - b.start);
    const completedThisMonth = pastSessions.filter(m => m.start.getMonth() === now.getMonth() && m.start.getFullYear() === now.getFullYear()).length;
    const totalCompletedSessions = pastSessions.length;
    const fiveMinutesBefore = nextSession ? new Date(nextSession.start.getTime() - 5 * 60 * 1000) : null;
    const isSessionActiveNow = nextSession && now >= fiveMinutesBefore && now <= nextSession.end;

    if (isLoading) return <div className="loading">טוען את מרכז הבקרה שלך...</div>;
    if (error) return <div className="error-state">{error}</div>;

    const formatFullDate = (date) => new Intl.DateTimeFormat('he-IL', { weekday: 'long', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
    const formatDateOnly = (date) => new Intl.DateTimeFormat('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);

    const getStatusText = (status) => {
        if (status === 'waiting') return 'ברשימת המתנה';
        if (status === 'pending') return 'ממתין לאישורך';
        return '';
    };

    return (
        <>
            <div className="pro-dashboard">
                <header className="dashboard-header-pro">
                    <div className="header-text">
                        <h1>שלום, {user?.full_name || "מתאמן"}!</h1>
                        <p>מוכנ/ה לכבוש את המטרות שלך היום? הנה תמונת המצב שלך.</p>
                    </div>
                    <button className="cta-button-pro" onClick={() => navigate('/schedule')}>
                        <span className="plus-icon">+</span>
                        הזמן שיעור חדש
                    </button>
                </header>

                <div className="dashboard-grid-pro">
                    <main className="main-panel-pro">
                        <section className="card-pro next-session-card">
                            <div className="card-header">
                                <span className="card-icon">📅</span>
                                <h2>{isSessionActiveNow ? 'השיעור הנוכחי שלך' : 'השיעור הבא שלך'}</h2>
                            </div>
                            {nextSession ? (
                                <>
                                    <p className="session-title">{nextSession.name}</p>
                                    <p className="session-trainer">עם {nextSession.trainerName}</p>
                                    <p className="session-time">{formatFullDate(nextSession.start)}</p>
                                    <div className="session-actions">
                                        {isSessionActiveNow ? (
                                            <button className="btn-primary confirm-arrival" onClick={() => handleConfirmArrival(nextSession.id)}>
                                                אישור הגעה
                                            </button>
                                        ) : (
                                            <>
                                                <button className="btn-primary" onClick={() => openSessionDetails(nextSession)}>פרטים</button>
                                                <button className="btn-secondary" onClick={() => handleAddToCalendar(nextSession)}>הוסף ליומן</button>
                                                <button className="btn-tertiary" onClick={() => handleCancel(nextSession.registrationId, nextSession.name)}>בטל הרשמה</button>
                                            </>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="placeholder-card">
                                    <h4>אין לך שיעורים קרובים.</h4>
                                    <p>זה הזמן המושלם לקבוע את האימון הבא שלך.</p>
                                </div>
                            )}
                        </section>
                        
                        <section className="card-pro progress-card">
                             <div className="card-header">
                                <span className="card-icon">🚀</span>
                                <h2>ההתקדמות שלך</h2>
                            </div>
                            <div className="stats-pills-container">
                                <StatPill label="אימונים החודש" value={completedThisMonth} icon="💪" />
                                <StatPill label="שיעורים עתידיים" value={upcomingSessions.length} icon="🗓️" />
                                <StatPill label="סה״כ אימונים" value={totalCompletedSessions} icon="🏆" />
                            </div>
                        </section>
                    </main>

                    <aside className="side-panel-pro">
                        <section className="card-pro list-card">
                            <div className="card-header">
                                <span className="card-icon">⏳</span>
                                <h2>רשימות המתנה ({waitingList.length})</h2>
                            </div>
                            {waitingList.length > 0 ? (
                                waitingList.map(item => 
                                    <ListItem 
                                        key={item.id}
                                        title={item.name}
                                        subtitle={`עם ${item.trainerName}`}
                                        status={getStatusText(item.status) || formatDateOnly(item.start)}
                                        statusType={item.status}
                                    />
                                )
                            ) : <p className="empty-state">אתה לא רשום לאף רשימת המתנה.</p>}
                        </section>

                        <section className="card-pro list-card">
                            <div className="card-header">
                                <span className="card-icon">📚</span>
                                <h2>היסטוריית שיעורים</h2>
                            </div>
                             {pastSessions.slice(0, 3).map(item => 
                                <ListItem 
                                    key={item.id}
                                    title={item.name}
                                    subtitle={formatDateOnly(item.start)}
                                />
                             )}
                             {pastSessions.length === 0 && <p className="empty-state">אין עדיין היסטוריית שיעורים.</p>}
                            <span className="see-all-link" onClick={() => navigate('/history')}>
                                הצג את כל ההיסטוריה →
                            </span>
                        </section>
                    </aside>
                </div>
            </div>
            
            <SessionDetailsModal 
                isOpen={isModalOpen} 
                onClose={closeSessionDetails} 
                session={selectedSession} 
                onCancel={handleCancel}
                showCancelButton={selectedSession && upcomingSessions.some(s => s.id === selectedSession.id)}
            />
        </>
    );
}

export default TraineeDashboard;