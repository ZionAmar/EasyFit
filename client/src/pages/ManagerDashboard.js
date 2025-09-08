import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import DailySchedule from '../components/DailySchedule';
import StatCard from '../components/StatCard';
import StudioSettingsView from '../components/StudioSettingsView';
import TrainersView from '../components/TrainersView';
import MembersView from '../components/MembersView'; // <-- 1. Import the new MembersView component
import '../styles/ManagerDashboard.css';

// --- Internal View Components ---
const OverviewView = ({ stats }) => (
    <div className="dashboard-grid-pro">
        <main className="main-panel-pro">
            <section className="card-pro stats-container">
                <div className="stats-grid">
                    <StatCard label="מתאמנים פעילים" value={stats.activeMembers} icon="👥" />
                    <StatCard label="שיעורים היום" value={stats.classesToday} icon="🗓️" />
                    <StatCard label="מצטרפים החודש" value={stats.newMembersThisMonth} icon="📈" />
                </div>
            </section>
        </main>
        <aside className="side-panel-pro">
            <section className="card-pro">
                <DailySchedule />
            </section>
        </aside>
    </div>
);

// 2. Remove the placeholder for MembersView
// const MembersView = () => <div className="card-pro placeholder-view"><h2>ניהול מתאמנים</h2></div>;

function ManagerDashboard() {
    const navigate = useNavigate();
    
    const [currentView, setCurrentView] = useState('overview'); 
    const [basicData, setBasicData] = useState(null);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [basicDataRes, statsRes] = await Promise.all([
                    api.get('/api/studio/dashboard'),
                    api.get('/api/studio/dashboard/stats')
                ]);
                setBasicData(basicDataRes);
                setStats(statsRes);
            } catch (err) {
                setError("שגיאה בטעינת המידע.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllData();
    }, []);

    const renderView = () => {
        if (!basicData) return null; 
        switch (currentView) {
            case 'trainers': return <TrainersView />;
            case 'members': return <MembersView />; // This now renders the real component
            case 'settings': return <StudioSettingsView initialDetails={basicData.studio} />;
            case 'overview': default: return <OverviewView stats={stats} />;
        }
    };

    if (isLoading) return <div className="loading">טוען את מרכז הבקרה...</div>;
    if (error) return <div className="error-state">{error}</div>;
    if (!basicData) return <h2>לא נמצא מידע סטודיו.</h2>;

    const { studio, user } = basicData;

    return (
        <div className="pro-dashboard manager-view">
            <header className="dashboard-header-pro">
                <div className="header-text">
                    <h1>מרכז הבקרה</h1>
                    <p>שלום {user.full_name}, ברוך הבא לאזור הניהול של {studio.name}.</p>
                </div>
                <button className="cta-button-pro" onClick={() => navigate('/manage/schedule')}>
                    <span className="plus-icon">📅</span>
                    לוח שנה מלא
                </button>
            </header>

            <div className="view-switcher">
                <button onClick={() => setCurrentView('overview')} className={currentView === 'overview' ? 'active' : ''}>סקירה כללית</button>
                <button onClick={() => setCurrentView('trainers')} className={currentView === 'trainers' ? 'active' : ''}>מאמנים</button>
                <button onClick={() => setCurrentView('members')} className={currentView === 'members' ? 'active' : ''}>מתאמנים</button>
                <button onClick={() => setCurrentView('settings')} className={currentView === 'settings' ? 'active' : ''}>הגדרות</button>
            </div>
            
            <div className="view-content">
                {renderView()}
            </div>
        </div>
    );
}

export default ManagerDashboard;