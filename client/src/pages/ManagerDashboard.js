import React from 'react';
// import StatCard from './StatCard';
// import PopularClassesChart from './PopularClassesChart';
// import QuickActions from './QuickActions';

function ManagerDashboard() {

  // כאן תבוא לוגיקה שתשלוף מהשרת נתונים מעובדים וסטטיסטיקות

  return (
    <div className="dashboard-container manager-dashboard">
      <h1>סקירת הסטודיו</h1>

      <div className="stats-grid">
        {/* <StatCard title="תפוסה היום" value="78%" /> */}
        {/* <StatCard title="הכנסה חודשית" value="15,200 ₪" /> */}
        {/* <StatCard title="חברים חדשים" value="12" /> */}
        <p>[כרטיסיות נתונים יופיעו כאן]</p>
      </div>
      
      <div className="main-dashboard-grid">
        <div className="main-panel">
            <h3>שיעורים פופולריים</h3>
            {/* <PopularClassesChart data={...} /> */}
            <p>[גרף שיעורים פופולריים יופיע כאן]</p>
        </div>
        <div className="side-panel">
            <h3>פעילות אחרונה</h3>
            {/* <ActivityFeed /> */}
            <p>[פיד פעילות חיה יופיע כאן]</p>
        </div>
      </div>
    </div>
  );
}

export default ManagerDashboard;