import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UpcomingSessionCard from '../components/UpcomingSessionCard';
import WaitingListStatus from '../components/WaitingListStatus';

function TraineeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [myMeetings, setMyMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // הוספנו את הפרמטר ?role=member כדי לבקש מהשרת את המידע הנכון
    fetch(`/api/meetings?role=member`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
            setMyMeetings(data);
        } else {
            setMyMeetings([]);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching meetings:", err);
        setIsLoading(false);
      });
  }, []);

  const now = new Date();

  const upcomingSessions = myMeetings
    .filter(m => new Date(m.date) >= now && m.status !== 'waiting')
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const nextSession = upcomingSessions.length > 0 ? upcomingSessions[0] : null;

  const waitingList = myMeetings.filter(m => m.status === 'waiting');

  if (isLoading) {
    return <div>טוען את המידע שלך...</div>;
  }

  return (
    <div className="dashboard-container trainee-dashboard">
      <h1>שלום, {user.full_name}!</h1>
      <p>מוכן לזוז? הנה מה שמחכה לך:</p>
      
      <div className="main-dashboard-grid">
        <div className="main-panel">
          <h3>השיעור הבא שלך:</h3>
          {nextSession ? (
            <UpcomingSessionCard session={nextSession} />
          ) : (
            <p>אין לך שיעורים קרובים. זה הזמן לקבוע אחד!</p>
          )}
        </div>
        <div className="side-panel">
          <h3>רשימות המתנה</h3>
          <WaitingListStatus list={waitingList} />
        </div>
      </div>

      <button className="cta-button" onClick={() => navigate('/TraineeDashboard')}>
        מצא והזמן שיעור חדש
      </button>
    </div>
  );
}

export default TraineeDashboard;