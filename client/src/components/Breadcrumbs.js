import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import '../styles/Breadcrumbs.css';

const breadcrumbNameMap = {
  'dashboard': 'דשבורד',
  'schedule': 'לוח שיעורים',
  'history': 'היסטוריה',
  'manage': 'ניהול', 
  'trainer-history': 'היסטוריה',
};

const breadcrumbPathMap = {
    'manage': '/dashboard', 
};


function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.replace('/main-content', '').split('/').filter((x) => x);

  if (pathnames.length === 0 || (pathnames.length === 1 && pathnames[0] === 'dashboard')) {
    return null;
  }

  return (
    <div className="breadcrumbs">
      <Link to="/dashboard">בית</Link>
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        
        const to = breadcrumbPathMap[value] || `/${pathnames.slice(0, index + 1).join('/')}`;
        
        const name = breadcrumbNameMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

        return last ? (
          <span key={to}>
            <span>&gt;</span>
            <span className="current-page">{name}</span>
          </span>
        ) : (
          <span key={to}>
            <span>&gt;</span>
            <Link to={to}>{name}</Link>
          </span>
        );
      })}
    </div>
  );
}

export default Breadcrumbs;