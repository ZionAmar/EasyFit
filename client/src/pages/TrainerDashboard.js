import React from 'react';
import { useAuth } from '../context/AuthContext';
// import TodaysScheduleList from './TodaysScheduleList';
// import NextClassRoster from './NextClassRoster';

function TrainerDashboard() {
  const { user } = useAuth();
  
  // כאן תבוא לוגיקה שתשלוף מהשרת רק את השיעורים של המאמן הנוכחי
  
  return (
    <div className="dashboard-container trainer-dashboard">
      <h1>דאשבורד המאמן</h1>
      <h2>שלום, {user.full_name}</h2>
      
      <div className="main-dashboard-grid">
        <div className="main-panel">
          <h3>השיעור הבא שלך:</h3>
          {/* <NextClassRoster classInfo={...} /> */}
          <p>[פירוט על השיעור הבא והרשומים יופיע כאן]</p>
        </div>
        <div className="side-panel">
          <h3>לו"ז להיום:</h3>
          {/* <TodaysScheduleList schedule={...} /> */}
          <p>[רשימת השיעורים להיום תופיע כאן]</p>
        </div>
      </div>
    </div>
  );
}

export default TrainerDashboard;