import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LandingPageHeader.css';

function LandingPageHeader({ simplified = false }) {
    const navigate = useNavigate();

    return (
        <header className={`lp-header ${simplified ? 'lp-header--simplified' : ''}`}>
            <div className="lp-header-content">
                <div className="lp-logo" onClick={() => navigate('/')}>
                    EasyFit
                </div>

                {!simplified && (
                    <>
                        <nav className="lp-nav">
                            <a href="/#features">פיצ'רים</a>
                            <a href="/#pricing">מחירים</a>
                        </nav>
                        <div className="lp-actions">
                            <button className="lp-login-btn" onClick={() => navigate('/login')}>כניסה</button>
                        </div>
                    </>
                )}
            </div>
        </header>
    );
}

export default LandingPageHeader;