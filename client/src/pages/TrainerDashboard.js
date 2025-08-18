import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ClassRoster from '../components/ClassRoster';
import WaitingListStatus from '../components/WaitingListStatus'; 
import '../styles/Dashboard.css';

function TrainerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mySchedule, setMySchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch(`/api/meetings?role=trainer`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            // המרה לאובייקטי Date מיד בקבלת המידע
            const processedSchedule = data.map(m => ({
                ...m,
                start: new Date(m.start),
                end: new Date(m.end)
            }));
            setMySchedule(processedSchedule);
          } else {
            setMySchedule([]);
          }
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Error fetching trainer's schedule:", err);
          setIsLoading(false);
        });
    }
  }, [user]);

  // --- לוגיקה לעיבוד המידע (עם תיקון) ---
  const now = new Date();
  
  // >>> התיקון כאן: משווים ישירות את אובייקט ה-Date <<<
  const upcomingSessions = mySchedule
      .filter(m => m.start >= now)
      .sort((a,b) => a.start - b.start);
  
  const nextSession = upcomingSessions.length > 0 ? upcomingSessions[0] : null;

  const todaysSessions = mySchedule
    .filter(m => m.start.toDateString() === now.toDateString())
    .sort((a, b) => a.start - b.start);


  if (isLoading) {
    return <div className="loading">טוען את לוח הזמנים שלך...</div>;
  }

  return (
    <div className="dashboard-container trainer-dashboard">
      <div className="dashboard-header">
        <h1>שלום, {user.full_name}!</h1>
        <div className="quick-actions">
            <button className="secondary-button" onClick={() => navigate('/schedule')}>לוח זמנים מלא</button>
            <button className="cta-button" onClick={() => navigate('/new-appointment')}>+ הוסף שיעור חדש</button>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="main-panel">
          <div className="card">
            <h3>השיעור הבא שלך:</h3>
            {nextSession ? (
              <div>
                  <h4>{nextSession.name}</h4>
                  {/* >>> התיקון כאן: משתמשים בשדה start להצגת המידע <<< */}
                  <p><strong>תאריך:</strong> {nextSession.start.toLocaleDateString('he-IL')}</p>
                  <p><strong>שעה:</strong> {nextSession.start.toTimeString().slice(0, 5)}</p>
                  <h5 style={{marginTop: '1.5rem'}}>נרשמים ({nextSession.participants?.length || 0}):</h5>
                  <ClassRoster participants={nextSession.participants} />
                  <h5 style={{marginTop: '1.5rem'}}>ממתינים ({nextSession.waitingList?.length || 0}):</h5>
                  <WaitingListStatus waitingList={nextSession.waitingList} />
              </div>
            ) : (
              <p>אין לך שיעורים עתידיים בלו"ז.</p>
            )}
          </div>
        </div>

        <div className="side-panel">
          <div className="card">
            <h3>השיעורים להיום ({todaysSessions.length})</h3>
            {todaysSessions.length > 0 ? (
                <ul className="simple-list">
                    {todaysSessions.map(s => <li key={s.id}><span>{s.name}</span> <span>{s.start.toTimeString().slice(0,5)}</span></li>)}
                </ul>
            ) : (
                <p>סיימת להיום! 💪</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrainerDashboard;