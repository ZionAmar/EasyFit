import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: '', userName: '', pass: '', email: '', phone: '',
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(formData);
      alert('ההרשמה בוצעה בהצלחה! אנא התחבר.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'שגיאה בהרשמה');
    }
  };

  return (
    <div className="auth-page">
        <div className="auth-form-side">
            <div className="form-container">
              <h2>הרשמה</h2>
              <form onSubmit={handleSubmit}>
                <input name="full_name" placeholder="שם מלא" onChange={handleChange} required />
                <input name="userName" placeholder="שם משתמש" onChange={handleChange} required />
                <input name="pass" type="password" placeholder="סיסמה" onChange={handleChange} required />
                <input name="email" type="email" placeholder="אימייל" onChange={handleChange} required />
                <input name="phone" placeholder="טלפון" onChange={handleChange} required />
                {error && <p className="error">{error}</p>}
                <button type="submit">הרשמה</button>
              </form>
            </div>
        </div>
        <div className="auth-visual-side" />
    </div>
  );
}

export default RegisterPage;