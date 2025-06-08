// --- src/pages/DashboardPage.js ---
import React from 'react';
import { useAuth } from '../context/AuthContext';

function DashboardPage() {
  const { user } = useAuth();

  // This page will only be rendered if the user is logged in
  if (!user) {
    return null; // or a redirect component
  }

  return (
    <div className="page-center">
      <h1>ברוך הבא, {user.full_name || 'משתמש'}!</h1>
      <p>זהו איזור הדאשבורד האישי שלך.</p>
      {/* You can add more role-based content here */}
    </div>
  );
}

export default DashboardPage;