import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LandingPageHeader from '../components/LandingPageHeader';
import '../styles/auth.css';
import { getQuoteOfTheDay } from '../utils/quotes';

function RegisterPage() {
  const [formData, setFormData] = useState({
    studio_name: '',
    admin_full_name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const quote = getQuoteOfTheDay();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      alert('ההרשמה בוצעה בהצלחה! כעת תוכלו להתחבר.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'שגיאה ברישום הסטודיו');
    }
  };

  return (
    <div className="page-wrapper">
        <LandingPageHeader simplified />
        <main className="auth-page">
            <div className="auth-form-side">
                <div className="form-container">
                    <h2>יצירת חשבון סטודיו חדש</h2>
                    <p>הצטרפו ל-EasyFit והתחילו את תקופת הניסיון שלכם בחינם.</p>
                    <form onSubmit={handleSubmit}>
                        <input name="studio_name" placeholder="שם הסטודיו" onChange={handleChange} required />
                        <input name="admin_full_name" placeholder="השם המלא שלך" onChange={handleChange} required />
                        <input name="email" type="email" placeholder="אימייל" onChange={handleChange} required />
                        <input name="password" type="password" placeholder="סיסמה" onChange={handleChange} required />
                        {error && <p className="error">{error}</p>}
                        <button type="submit">יצירת חשבון וקדימה למים!</button>
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