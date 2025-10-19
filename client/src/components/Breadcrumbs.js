import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Breadcrumbs.css';

// --- מילון תרגומים משודרג ---
const breadcrumbNameMap = {
  'dashboard': 'דשבורד',
  'schedule': 'לוח שיעורים',
  'history': 'היסטוריה',
  'manage': 'ניהול', // We can keep this for the top level if needed
  'manage/schedule': 'ניהול לו"ז', // Specific name for the full path
  'trainer-history': 'היסטוריה',
  'owner-dashboard': 'דשבורד ניהול',
};

function Breadcrumbs() {
  const location = useLocation();
  const { user, activeRole } = useAuth();

  if (!user) {
    return null;
  }

  const pathnames = location.pathname.split('/').filter((x) => x);
  const homePath = activeRole === 'owner' ? '/owner-dashboard' : '/dashboard';
  
  // Don't show on main dashboards
  if (pathnames.length === 0 || (pathnames.length === 1 && (pathnames[0] === 'dashboard' || pathnames[0] === 'owner-dashboard'))) {
    return null;
  }

  return (
    <nav aria-label="breadcrumb" className="breadcrumbs-container">
      <ol className="breadcrumbs-list">
        <li className="breadcrumb-item">
            <Link to={homePath}>בית</Link>
        </li>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          
          // --- לוגיקה חדשה למציאת השם הנכון ---
          // Try to match the full path first (e.g., 'manage/schedule')
          const fullPathKey = pathnames.slice(0, index + 1).join('/');
          let name = breadcrumbNameMap[fullPathKey] || breadcrumbNameMap[value] || value;

          // Hide 'manage' if it's not the last item
          if (value === 'manage' && !last) {
            return null;
          }

          return (
            <li key={to} className="breadcrumb-item">
              {last ? (
                <span aria-current="page">{name}</span>
              ) : (
                <Link to={to}>{name}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;