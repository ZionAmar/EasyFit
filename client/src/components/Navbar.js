import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import RoleSwitcher from './RoleSwitcher';
import StudioSwitcher from './StudioSwitcher'; 
import '../styles/Navbar.css';

function Navbar() {
    const { user, logout, isLoading } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    
    const menuRef = useRef(null);
    const hamburgerRef = useRef(null);

    const handleLogout = async () => {
        setMenuOpen(false);
        await logout();
        navigate('/');
    };

    const handleNav = (path) => {
        setMenuOpen(false);
        navigate(path);
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuOpen && menuRef.current && !menuRef.current.contains(event.target) && hamburgerRef.current && !hamburgerRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuOpen]);

    if (isLoading) return null;

    return (
        <nav className="navbar">
            {/* --- מבנה תצוגת מחשב --- */}
            <div className="navbar-desktop-left">
                {user ? (
                    <>
                        <span onClick={handleLogout}>התנתק</span>
                        <RoleSwitcher />
                    </>
                ) : (
                    <span onClick={() => handleNav('/login')}>כניסה</span>
                )}
            </div>
            <div className="navbar-desktop-center">
                <span className="navbar-brand" onClick={() => handleNav('/dashboard')}>EasyFit</span>
            </div>
            <div className="navbar-desktop-right">
                {user ? <StudioSwitcher /> : <span onClick={() => handleNav('/register')}>הרשמה</span>}
            </div>

            <div className="navbar-mobile-brand">
                 <span className="navbar-brand" onClick={() => handleNav('/dashboard')}>EasyFit</span>
            </div>
            <div className="hamburger" ref={hamburgerRef} onClick={() => setMenuOpen(!menuOpen)}>
                ☰
            </div>
            <div className={`nav-links-mobile ${menuOpen ? 'open' : ''}`} ref={menuRef}>
                {user ? (
                    <>
                        <StudioSwitcher /> 
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