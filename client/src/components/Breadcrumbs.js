import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 1. מייבאים את useAuth כדי לדעת מי המשתמש
import '../styles/Breadcrumbs.css';

// 2. מילון תרגומים מעודכן שכולל את הדשבורד שלך
const breadcrumbNameMap = {
  'dashboard': 'דשבורד',
  'schedule': 'לוח שיעורים',
  'history': 'היסטוריה',
  'manage': 'ניהול',
  'trainer-history': 'היסטוריה',
  'owner-dashboard': 'דשבורד ניהול',
};

function Breadcrumbs() {
  const location = useLocation();
  const { user, activeRole } = useAuth(); // 3. שואבים את פרטי המשתמש והתפקיד הפעיל

  // אם המשתמש לא מחובר, אל תציג כלום
  if (!user) {
    return null;
  }

  const pathnames = location.pathname.split('/').filter((x) => x);
  
  // 4. קובעים באופן דינמי מהו "דף הבית" לפי התפקיד
  const homePath = activeRole === 'owner' ? '/owner-dashboard' : '/dashboard';
  const homeName = 'בית';

  // אל תציג פירורי לחם בדפי הדשבורד הראשיים
  if (pathnames.length === 0 || 
      (pathnames.length === 1 && (pathnames[0] === 'dashboard' || pathnames[0] === 'owner-dashboard'))) {
    return null;
  }

  return (
    <div className="breadcrumbs">
      <Link to={homePath}>{homeName}</Link>
      {pathnames.map((value, index) => {
        // 5. בונים את הנתיב המלא לכל שלב בצורה נכונה
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        
        const name = breadcrumbNameMap[value] || value;

        return (
          <span key={to}>
            <span>&gt;</span>
            {isLast ? (
              <span className="current-page">{name}</span>
            ) : (
              <Link to={to}>{name}</Link>
            )}
          </span>
        );
      })}
    </div>
  );
}

export default Breadcrumbs;