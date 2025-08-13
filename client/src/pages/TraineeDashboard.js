import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UpcomingSessionCard from '../components/UpcomingSessionCard';
import WaitingListStatus from '../components/WaitingListStatus';
import PastSessionsList from '../components/PastSessionsList';
import StatCard from '../components/StatCard';
import '../styles/Dashboard.css'; // ייבוא קובץ העיצוב החדש

function TraineeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [myMeetings, setMyMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/meetings?role=member`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMyMeetings(data);
        else setMyMeetings([]);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching meetings:", err);
        setIsLoading(false);
      });
  }, [user]);

  const now = new Date();
  const upcomingSessions = myMeetings.filter(m => new Date(m.date) >= now && (m.status === 'active' || m.status === 'confirmed')).sort((a, b) => new Date(a.date) - new Date(b.date));
  const nextSession = upcomingSessions.length > 0 ? upcomingSessions[0] : null;
  const waitingList = myMeetings.filter(m => m.status === 'waiting' || m.status === 'pending');
  const pastSessions = myMeetings.filter(m => new Date(m.date) < now && (m.status === 'active' || m.status === 'confirmed')).sort((a, b) => new Date(b.date) - new Date(a.date));
  const sessionsThisMonth = pastSessions.filter(m => new Date(m.date).getMonth() === now.getMonth() && new Date(m.date).getFullYear() === now.getFullYear()).length;

  if (isLoading) {
    return <div className="loading">טוען את המידע שלך...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>שלום, {user.full_name}!</h1>
        <button className="cta-button" onClick={() => navigate('/schedule')}>
            מצא והזמן שיעור חדש
        </button>
      </div>
      
      <div className="stats-container">
        <StatCard title="אימונים שהושלמו החודש" value={sessionsThisMonth} />
        <StatCard title="שיעורים עתידיים" value={upcomingSessions.length} />
        <StatCard title="ברשימות המתנה" value={waitingList.length} />
      </div>

      <div className="dashboard-grid">
        <div className="main-panel">
          <div className="card">
            <h3>השיעור הבא שלך:</h3>
            {nextSession ? (
              <UpcomingSessionCard session={nextSession} />
            ) : (
              <div className="placeholder-card">
                  <h4>אין לך שיעורים קרובים</h4>
                  <p>זה הזמן המושלם לקבוע את האימון הבא שלך ולהתקדם לעבר המטרות.</p>
              </div>
            )}
          </div>
        </div>

        <div className="side-panel">
          <div className="card">
            <h3>היסטוריית שיעורים</h3>
            <PastSessionsList sessions={pastSessions.slice(0, 5)} />
          </div>
          <div className="card">
            <h3>רשימות המתנה</h3>
            <WaitingListStatus list={waitingList} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TraineeDashboard;