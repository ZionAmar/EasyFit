import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';
import RoleSwitcher from './RoleSwitcher';
import ProfileModal from './ProfileModal'; 
import '../styles/Navbar.css';

const DesktopProfile = ({ user, onClick }) => (
    <div className="desktop-profile" onClick={onClick} title="עריכת פרופיל">
        <div className="profile-avatar-desktop">
            {user.profile_picture_url ? (
                <img src={user.profile_picture_url} alt="תמונת פרופיל" />
            ) : (
                <span>{user.full_name?.charAt(0)}</span>
            )}
        </div>
    </div>
);


function Navbar() {
    const { user, logout, isLoading, activeRole, activeStudio } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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
    };

    const closeMenu = () => setMenuOpen(false);

    const openProfileModal = () => {
        setMenuOpen(false); 
        setIsProfileModalOpen(true);
    };
    const closeProfileModal = () => setIsProfileModalOpen(false);

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

    const brandName = activeStudio?.studio_name || 'FiTime';

    const renderNavLinks = () => {
        switch (activeRole) {
            case 'owner':
                return (
                    <NavLink to="/owner-dashboard" className="nav-link" onClick={closeMenu}>
                        ניהול מערכת
                    </NavLink>
                );
            case 'admin':
                return (
                    <>
                        <NavLink to="/dashboard" className="nav-link" onClick={closeMenu}>מרכז הבקרה</NavLink>
                        <NavLink to="/manage/schedule" className="nav-link" onClick={closeMenu}>ניהול לו"ז</NavLink>
                    </>
                );
            case 'trainer':
                return (
                    <>
                        <NavLink to="/dashboard" className="nav-link" onClick={closeMenu}>דשבורד</NavLink>
                        <NavLink to="/schedule" className="nav-link" onClick={closeMenu}>לוח שיעורים</NavLink>
                        <NavLink to="/trainer-history" className="nav-link" onClick={closeMenu}>היסטוריה</NavLink>
                    </>
                );
            case 'member':
            default:
                return (
                    <>
                        <NavLink to="/dashboard" className="nav-link" onClick={closeMenu}>דשבורד</NavLink>
                        <NavLink to="/schedule" className="nav-link" onClick={closeMenu}>לוח שיעורים</NavLink>
                        <NavLink to="/history" className="nav-link" onClick={closeMenu}>היסטוריה</NavLink>
                    </>
                );
        }
    };

    return (
        <>
            <nav className="navbar">
                <div className="navbar-desktop-left">
                    {user ? renderNavLinks() : <NavLink to="/login" className="nav-link">כניסה</NavLink>}
                </div>
                <div className="navbar-desktop-center">
                    <span className="navbar-brand" onClick={() => handleNav(user ? '/dashboard' : '/')}>
                        {brandName}
                    </span>
                </div>
                <div className="navbar-desktop-right">
                    {user ? (
                        <>
                            <RoleSwitcher />
                            <span className="nav-link" onClick={handleLogout}>התנתק</span>
                            <DesktopProfile user={user} onClick={openProfileModal} />
                        </>
                    ) : (
                        null
                    )}
                </div>

                <div className={`hamburger ${menuOpen ? 'open' : ''}`} ref={hamburgerRef} onClick={() => setMenuOpen(!menuOpen)}>
                    <span className="hamburger-bar"></span>
                    <span className="hamburger-bar"></span>
                    <span className="hamburger-bar"></span>
                </div>
                <div className="navbar-mobile-brand">
                     <span className="navbar-brand" onClick={() => handleNav(user ? '/dashboard' : '/')}>
                         {brandName}
                     </span>
                </div>
                
                <div ref={menuRef} className={`nav-links-mobile ${menuOpen ? 'open' : ''}`}>
                    {user ? (
                        <>
                            <div className="mobile-menu-profile" onClick={openProfileModal}>
                                <div className="profile-avatar">
                                    {user.profile_picture_url ? (
                                        <img src={user.profile_picture_url} alt="תמונת פרופיל" />
                                    ) : (
                                        <span>{user.full_name?.charAt(0)}</span>
                                    )}
                                </div>
                                <div className="profile-info">
                                    <span className="profile-name">{user.full_name}</span>
                                    <span className="profile-email">{user.email}</span>
                                </div>
                            </div>
                            <div className="mobile-menu-section">
                                <RoleSwitcher />
                            </div>
                            <hr/>
                            <div className="mobile-menu-section">
                                {renderNavLinks()}
                            </div>
                            <hr/>
                            <span className="nav-link" onClick={handleLogout}>התנתק</span>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" className="nav-link" onClick={closeMenu}>כניסה</NavLink>
                        </>
                    )}
                </div>
            </nav>
            <div className={`nav-links-mobile-overlay ${menuOpen ? 'open' : ''}`} onClick={closeMenu} />

            {user && (
                <ProfileModal 
                    isOpen={isProfileModalOpen} 
                    onClose={closeProfileModal} 
                />
            )}
        </>
    );
}

export default Navbar;