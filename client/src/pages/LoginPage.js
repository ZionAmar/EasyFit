import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import LandingPageHeader from '../components/LandingPageHeader';
import '../styles/auth.css';
import { getQuoteOfTheDay } from '../utils/quotes';

function LoginPage() {
    const [userName, setUserName] = useState('');
    const [pass, setPass] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const quote = getQuoteOfTheDay();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // The 'login' function from context now handles navigation.
            await login(userName, pass);
        } catch (err) {
            setError(err.message || 'שם משתמש או סיסמה שגויים');
            setIsLoading(false); // Stop loading only on error
        }
        // On success, the component will unmount due to navigation,
        // so no need to set loading to false here.
    };

    return (
        <div className="page-wrapper">
            <LandingPageHeader simplified /> 
            <main className="auth-page">
                <div className="auth-form-side">
                    <div className="form-container">
                        <h2>כניסת משתמש</h2>
                        <form onSubmit={handleSubmit}>
                            <input 
                                type="text" 
                                placeholder="שם משתמש" 
                                value={userName} 
                                onChange={(e) => setUserName(e.target.value)} 
                                required 
                                disabled={isLoading}
                            />
                            <input 
                                type="password" 
                                placeholder="סיסמה" 
                                value={pass} 
                                onChange={(e) => setPass(e.target.value)} 
                                required 
                                disabled={isLoading}
                            />
                            {error && <p className="error">{error}</p>}
                            <button type="submit" className="btn btn-primary auth-button" disabled={isLoading}>
                                {isLoading ? 'מתחבר...' : 'כניסה למערכת'}
                            </button>
                        </form>
                        <p className="auth-switch">
                            עדיין אין לך חשבון? <Link to="/register">הירשם</Link>
                        </p>
                    </div>
                </div>
                <div className="auth-visual-side">
                    <div className="auth-quote-container">
                        <p className="auth-quote">"{quote}"</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default LoginPage;