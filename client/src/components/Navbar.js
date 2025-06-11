import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (isLoading) return null;

  return (
    <nav className="navbar">
      <span className="navbar-brand" onClick={() => navigate('/')}>EasyFit</span>
      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        {user ? (
          <>
            {!isDashboard && (
              <span onClick={() => navigate('/dashboard')}>דשבורד</span>
            )}
            <span onClick={handleLogout}>התנתק</span>
          </>
        ) : (
          <>
            <span onClick={() => navigate('/login')}>כניסה</span>
            <span onClick={() => navigate('/register')}>הרשמה</span>
          </>
        )}
      </div>
      <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </div>
    </nav>
  );
}

export default Navbar;
