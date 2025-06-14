import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [userName, setUserName] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(userName, pass);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'שגיאה בכניסה');
    }
  };

  return (
    <div className="form-container">
      <h2>כניסת משתמש</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="שם משתמש" value={userName} onChange={(e) => setUserName(e.target.value)} required />
        <input type="password" placeholder="סיסמה" value={pass} onChange={(e) => setPass(e.target.value)} required />
        {error && <p className="error">{error}</p>}
        <button type="submit">כניסה</button>
      </form>
    </div>
  );
}

export default LoginPage;
