import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import LandingPageHeader from '../components/LandingPageHeader';
import '../styles/auth.css';
import { getQuoteOfTheDay } from '../utils/quotes';

function RegisterPage() {
    const [formData, setFormData] = useState({
        studio_name: '',
        admin_full_name: '',
        userName: '',
        email: '',
        password: '',
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const quote = getQuoteOfTheDay();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (fieldErrors[e.target.name]) {
            setFieldErrors(prev => ({ ...prev, [e.target.name]: null }));
        }
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});
        setIsLoading(true);

        try {
            await api.post('/api/auth/register', formData); 
            
            alert('ההרשמה בוצעה בהצלחה! כעת תועבר לדף הכניסה.');
            navigate('/login');
        } catch (err) {
            const serverResponse = err.response?.data;
            
            if (serverResponse && serverResponse.field) {
                setFieldErrors({ [serverResponse.field]: serverResponse.message });
                setError(''); 
            } else {
                setError(err.message || 'שגיאה לא צפויה ברישום. נסה שנית.');
            }
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
                        <h2>יצירת חשבון סטודיו חדש</h2>
                        <p>הצטרפו ל-FiTime והתחילו את תקופת הניסיון שלכם בחינם.</p>
                        <form onSubmit={handleSubmit}>
                            <input name="studio_name" placeholder="שם הסטודיו" onChange={handleChange} required disabled={isLoading} />
                            {fieldErrors.studio_name && <p className="error field-error">{fieldErrors.studio_name}</p>} 
                            
                            <input name="admin_full_name" placeholder="השם המלא שלך" onChange={handleChange} required disabled={isLoading} />
                            
                            <input name="userName" placeholder="שם משתמש (באנגלית)" onChange={handleChange} required disabled={isLoading} />
                            {fieldErrors.userName && <p className="error field-error">{fieldErrors.userName}</p>} 
                            
                            <input name="email" type="email" placeholder="אימייל" onChange={handleChange} required disabled={isLoading} />
                            {fieldErrors.email && <p className="error field-error">{fieldErrors.email}</p>} 
                            
                            <input name="password" type="password" placeholder="סיסמה" onChange={handleChange} required disabled={isLoading} />
                            
                            {error && !Object.values(fieldErrors).some(e => e) && <p className="error">{error}</p>}
                            
                            <button type="submit" disabled={isLoading}>
                                {isLoading ? 'יוצר חשבון...' : 'יצירת חשבון'}
                            </button>
                        </form>
                        <p className="auth-switch">
                            כבר יש לך חשבון? <Link to="/login">התחבר</Link>
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

export default RegisterPage;