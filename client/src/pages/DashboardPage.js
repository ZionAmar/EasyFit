import React from 'react';
import { useAuth } from '../context/AuthContext'; 

import TraineeDashboard from './TraineeDashboard';
import TrainerDashboard from './TrainerDashboard';
import ManagerDashboard from './ManagerDashboard';

function DashboardPage() {
  const { activeRole, isLoading } = useAuth();

  if (isLoading || !activeRole) {
    return <div>טוען...</div>;
  }
  
  switch (activeRole) {
    case 'admin':
      return <ManagerDashboard />;
    case 'trainer':
      return <TrainerDashboard />;
    case 'member':
      return <TraineeDashboard />;
    default:
      return <div>לא זוהו הרשאות מתאימות.</div>;
  }
}

export default DashboardPage;