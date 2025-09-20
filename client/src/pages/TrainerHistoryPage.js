import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/HistoryPage.css';

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
                    <p><strong>משתתפים:</strong> {session.participant_count || 0} </p>
                    <p><strong>סטטוס:</strong> הושלם</p>
                </div>
            </div>
        </div>
    );
};

const HistoryCard = ({ session, onShowDetails }) => {
    const formatTime = (date) => new Intl.DateTimeFormat('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date);

    return (
        <div className="history-card">
            <div className="card-date-badge">
                <span className="day">{session.start.getDate()}</span>
                <span className="month">{session.start.toLocaleString('he-IL', { month: 'short' })}</span>
            </div>
            <div className="card-details">
                <h3 className="session-name">{session.name}</h3>
                <div className="session-meta">
                    <span>{formatTime(session.start)}</span>
                    <span>|</span>
                    <span>חדר {session.roomName}</span>
                    <span>|</span>
                    <span>{session.participant_count || 0} משתתפים</span>
                </div>
            </div>
            <div className="card-actions">
                <button className="details-btn-secondary" onClick={() => onShowDetails(session)}>
                    פרטים
                </button>
            </div>
        </div>
    );
};

function TrainerHistoryPage() {
    const { user, activeStudio } = useAuth();
    const navigate = useNavigate();
    const [pastSessions, setPastSessions] = useState([]);
    const [filteredSessions, setFilteredSessions] = useState([]);
    const [months, setMonths] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            setIsLoading(true);
            try {
                const data = await api.get('/api/meetings'); 
                
                if (Array.isArray(data)) {
                    const now = new Date();
                    const processed = data
                        .map(m => ({ ...m, start: new Date(m.start), end: new Date(m.end) }))
                        .filter(m => m.end < now) 
                        .sort((a, b) => b.start - a.start);

                    setPastSessions(processed);
                    setFilteredSessions(processed);

                    const uniqueMonths = [...new Set(processed.map(s => s.start.toISOString().slice(0, 7)))];
                    setMonths(uniqueMonths);
                }
            } catch (error) {
                console.error("Error fetching trainer history:", error);
                setPastSessions([]); 
                setFilteredSessions([]);
            } finally {
                setIsLoading(false);
            }
        };

        if (user && activeStudio) {
            fetchHistory();
        } else {
            setIsLoading(false);
        }
    }, [user, activeStudio]); 

    const handleMonthChange = (e) => {
        const month = e.target.value;
        setSelectedMonth(month);
        if (month === 'all') {
            setFilteredSessions(pastSessions);
        } else {
            const filtered = pastSessions.filter(s => s.start.toISOString().slice(0, 7) === month);
            setFilteredSessions(filtered);
        }
    };
    
    const formatMonthForDisplay = (monthString) => {
        const date = new Date(monthString + '-02');
        return date.toLocaleString('he-IL', { month: 'long', year: 'numeric' });
    };

    const handleShowDetails = (session) => {
        setSelectedSession(session);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedSession(null);
        setIsModalOpen(false);
    };

    if (isLoading) {
        return <div className="loading">טוען את היסטוריית השיעורים...</div>;
    }

    return (
        <div className="history-page-container">
            <header className="history-header">
                <div className="header-content">
                    <h1>היסטוריית שיעורים</h1>
                    <p>
                        {pastSessions.length === 1
                            ? 'סה"כ העברת שיעור אחד.'
                            : `סה"כ העברת ${pastSessions.length} שיעורים.`
                        }
                        {pastSessions.length >= 1 && ' יישר כוח!'}
                    </p>
                </div>
                <div className="filter-container">
                    <label htmlFor="month-filter">סנן לפי חודש:</label>
                    <select id="month-filter" value={selectedMonth} onChange={handleMonthChange}>
                        <option value="all">כל החודשים</option>
                        {months.map(month => (
                            <option key={month} value={month}>
                                {formatMonthForDisplay(month)}
                            </option>
                        ))}
                    </select>
                </div>
            </header>

            <main className="history-list">
                {filteredSessions.length > 0 ? (
                    filteredSessions.map(session => (
                        <HistoryCard 
                            key={session.id} 
                            session={session} 
                            onShowDetails={handleShowDetails}
                        />
                    ))
                ) : (
                    <div className="empty-state-history">
                        <h3>לא נמצאו שיעורים שהושלמו.</h3>
                    </div>
                )}
            </main>

            {isModalOpen && selectedSession && (
                <SessionDetailsModal session={selectedSession} onClose={handleCloseModal} />
            )}
        </div>
    );
}

export default TrainerHistoryPage;
