import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/HistoryPage.css'; // שימוש חוזר באותו עיצוב, אין צורך בקובץ CSS חדש

// --- רכיב עזר: כרטיסיית שיעור בהיסטוריה ---
const HistoryCard = ({ session }) => {
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
            <div className="card-status">
                הושלם
            </div>
        </div>
    );
};

// --- רכיב הדף הראשי ---
function TrainerHistoryPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [pastSessions, setPastSessions] = useState([]);
    const [filteredSessions, setFilteredSessions] = useState([]);
    const [months, setMonths] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch('/api/meetings?role=trainer');
                if (!response.ok) throw new Error('Failed to fetch history');
                const data = await response.json();

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
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, [user]);

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

    if (isLoading) {
        return <div className="loading">טוען את היסטוריית השיעורים...</div>;
    }

    return (
        <div className="history-page-container">
            <header className="history-header">
                <div className="header-content">
                    <h1>היסטוריית שיעורים</h1>
                    <p>סה"כ העברת {pastSessions.length} שיעורים. יישר כוח!</p>
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
                    filteredSessions.map(session => <HistoryCard key={session.id} session={session} />)
                ) : (
                    <div className="empty-state-history">
                        <h3>לא נמצאו שיעורים שהושלמו.</h3>
                    </div>
                )}
            </main>
        </div>
    );
}

export default TrainerHistoryPage;
