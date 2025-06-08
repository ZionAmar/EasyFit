// --- src/pages/LoginPage.js ---
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function LoginPage({ setCurrentPage }) {
  const [userName, setUserName] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(userName, pass);
      setCurrentPage('dashboard');
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
