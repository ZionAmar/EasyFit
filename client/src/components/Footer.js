import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Footer.css';

function Footer() {
    const navigate = useNavigate();

    return (
        <footer className="main-app-footer">
            <div className="main-footer-content">
                <div className="footer-credits">
                    <span className="copyright-text">
                        © {new Date().getFullYear()} FiTime. כל הזכויות שמורות.
                    </span>
                    <a 
                        href="https://aztodev.com/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="aztodev-credit"
                    >
                        נבנה ע"י AzToDev
                    </a>
                </div>
                <div className="footer-logo" onClick={() => navigate('/')}>
                    <img src="/images/logo.png" alt="FiTime Logo" />
                </div>
            </div>
        </footer>
    );
}

export default Footer;