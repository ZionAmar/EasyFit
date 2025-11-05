import React from 'react';
import { useAuth } from '../context/AuthContext'; 

import MemberDashboard from './MemberDashboard';
import TrainerDashboard from './TrainerDashboard';
import ManagerDashboard from './ManagerDashboard';

function DashboardPage() {
    const { activeRole, isLoading } = useAuth();

    if (isLoading || !activeRole) {
        return <div>טוען את נתוני המשתמש...</div>;
    }
    
    switch (activeRole) {
        case 'admin':
            return <ManagerDashboard />;
        case 'trainer':
            return <TrainerDashboard />;
        case 'member':
            return <MemberDashboard />;
        default:
            return <div>שגיאה: לא זוהה תפקיד פעיל ומתאים עבור הסטודיו הנוכחי.</div>;
    }
}

export default DashboardPage;