import React, { useState } from 'react';
import StudiosManagement from '../components/StudiosManagement';
import UsersManagement from '../components/UsersManagement';
import '../styles/OwnerDashboard.css';

function OwnerDashboardPage() {
    const [activeView, setActiveView] = useState('studios');

    return (
        <div className="pro-dashboard">
            <div className="dashboard-header-pro">
                <div className="header-text">
                    <h1>דשבורד ניהול ראשי</h1>
                    <p>מכאן תוכל לנהל את כל הסטודיואים והמשתמשים הרשומים במערכת FiTime.</p>
                </div>
                <nav className="dashboard-nav">
                    <button 
                        className={`nav-btn ${activeView === 'studios' ? 'active' : ''}`}
                        onClick={() => setActiveView('studios')}
                    >
                        🏢 ניהול סטודיואים
                    </button>
                    <button 
                        className={`nav-btn ${activeView === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveView('users')}
                    >
                        👥 ניהול משתמשים
                    </button>
                </nav>
            </div>

            <div className="dashboard-content">
                {activeView === 'studios' && <StudiosManagement />}
                {activeView === 'users' && <UsersManagement />}
            </div>
        </div>
    );
}

export default OwnerDashboardPage;