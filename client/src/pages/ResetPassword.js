import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api'; 
import LandingPageHeader from '../components/LandingPageHeader';
import { getQuoteOfTheDay } from '../utils/quotes'; 
import '../styles/auth.css';

function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { token } = useParams(); 
    const navigate = useNavigate();
    const quote = getQuoteOfTheDay();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError('הסיסמאות אינן תואמות.');
            return;
        }
        
        if (password.length < 6) {
            setError('הסיסמה חייבת להכיל לפחות 6 תווים.');
            return;
        }

        setError('');
        setMessage('');
        setIsLoading(true);

        try {
            await api.post('/api/auth/reset-password', {
                token: token,
                newPassword: password
            });

            setMessage('הסיסמה עודכנה בהצלחה! מועבר לעמוד ההתחברות...');
            
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err) {
            setError(err.message || 'אירעה שגיאה. הקישור אינו תקין או שפג תוקפו.');
            console.error('Reset password error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-wrapper">
            <LandingPageHeader simplified />
            <main className="auth-page">
                <div className="auth-form-side">
                    <div className="form-container">
                        <h2>הגדרת סיסמה חדשה</h2>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="password"
                                placeholder="סיסמה חדשה"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading || message} 
                            />
                            <input
                                type="password"
                                placeholder="אישור סיסמה חדשה"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={isLoading || message} 
                            />

                            {error && <p className="error">{error}</p>}
                            {message && <p style={{ color: 'green', marginBottom: '1rem' }}>{message}</p>}

                            <button type="submit" className="btn btn-primary auth-button" disabled={isLoading || message}>
                                {isLoading ? 'מעדכן...' : 'עדכן סיסמה'}
                            </button>
                        </form>
                         <p className="auth-switch">
                            <Link to="/login">חזרה להתחברות</Link>
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

export default ResetPassword;