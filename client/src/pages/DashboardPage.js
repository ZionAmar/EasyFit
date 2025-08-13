import React from 'react';
// >>> עדכון: אנחנו צריכים לשלוף גם את activeRole
import { useAuth } from '../context/AuthContext'; 

import TraineeDashboard from './TraineeDashboard';
import TrainerDashboard from './TrainerDashboard';
import ManagerDashboard from './ManagerDashboard';

function DashboardPage() {
  // >>> עדכון: שולפים את activeRole מהקונטקסט
  const { activeRole, isLoading } = useAuth();

  // בדיקה טובה יותר למצב טעינה
  if (isLoading || !activeRole) {
    return <div>טוען...</div>;
  }
  
  // >>> עדכון: שינינו את כל הלוגיקה ל-switch פשוט
  // שמתבסס אך ורק על התפקיד הפעיל
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