// src/components/Navbar.js
import React from 'react';
import { useAuth } from '../context/AuthContext';

function Navbar({ setCurrentPage }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setCurrentPage('home');
  };

  return (
    <nav className="navbar">
      <span className="navbar-brand" onClick={() => setCurrentPage('home')}>EasyFit</span>
      <div className="nav-links">
        {user ? (
          <>
            <span onClick={() => setCurrentPage('dashboard')}>דאשבורד</span>
            <button onClick={handleLogout} className="nav-button">התנתק</button>
          </>
        ) : (
          <>
            <span onClick={() => setCurrentPage('login')}>כניסה</span>
            <span onClick={() => setCurrentPage('register')}>הרשמה</span>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;