import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext'; // ודא שהנתיב נכון
import { useNavigate } from 'react-router-dom';
import RoleSwitcher from './RoleSwitcher'; // ייבוא של הרכיב החדש
import '../styles/Navbar.css'; // ייבוא של קובץ העיצוב

function Navbar() {
    const { user, logout, isLoading } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    // Refs כדי לזהות לחיצות מחוץ לתפריט
    const menuRef = useRef(null);
    const hamburgerRef = useRef(null);

    const handleLogout = async () => {
        setMenuOpen(false); // סגירת התפריט בפעולה
        await logout();
        navigate('/');
    };

    const handleNav = (path) => {
        setMenuOpen(false); // סגירת התפריט בפעולה
        navigate(path);
    }

    // Hook שסוגר את התפריט בלחיצה בחוץ
    useEffect(() => {
        const handleClickOutside = (event) => {
            // אם התפריט פתוח והלחיצה היא לא בתוך התפריט או על כפתור ההמבורגר
            if (menuOpen && menuRef.current && !menuRef.current.contains(event.target) && hamburgerRef.current && !hamburgerRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        // הוספת מאזין לאירוע
        document.addEventListener('mousedown', handleClickOutside);

        // ניקוי המאזין כשהרכיב יורד מהמסך
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuOpen]); // מריצים את האפקט מחדש רק אם menuOpen משתנה

    if (isLoading) return null;

    return (
        <nav className="navbar">
            {/* --- מבנה תצוגת מחשב --- */}
            <div className="navbar-desktop-left">
                {user ? <span onClick={handleLogout}>התנתק</span> : <span onClick={() => handleNav('/login')}>כניסה</span>}
            </div>
            <div className="navbar-desktop-center">
                <span className="navbar-brand" onClick={() => handleNav('/dashboard')}>EasyFit</span>
            </div>
            <div className="navbar-desktop-right">
                {user ? <RoleSwitcher /> : <span onClick={() => handleNav('/register')}>הרשמה</span>}
            </div>

            {/* --- מבנה תצוגת מובייל --- */}
            <div className="navbar-mobile-brand">
                 <span className="navbar-brand" onClick={() => handleNav('/dashboard')}>EasyFit</span>
            </div>
            <div className="hamburger" ref={hamburgerRef} onClick={() => setMenuOpen(!menuOpen)}>
                ☰
            </div>
            <div className={`nav-links-mobile ${menuOpen ? 'open' : ''}`} ref={menuRef}>
                {user ? (
                    <>
                        <RoleSwitcher />
                        <span onClick={handleLogout}>התנתק</span>
                    </>
                ) : (
                    <>
                        <span onClick={() => handleNav('/login')}>כניסה</span>
                        <span onClick={() => handleNav('/register')}>הרשמה</span>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
