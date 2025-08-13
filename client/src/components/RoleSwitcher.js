import React from 'react';
import { useAuth } from '../context/AuthContext'; // ודא שהנתיב נכון

function RoleSwitcher() {
  // מהקונטקסט אנחנו שולפים את המשתמש, התפקיד הפעיל, והפונקציה שמחליפה תפקיד
  const { user, activeRole, switchRole } = useAuth();

  // אם אין משתמש, או שיש לו רק תפקיד אחד - אל תציג כלום
  if (!user || user.roles.length <= 1) {
    return null;
  }

  // הפונקציה שתופעל כשהמשתמש בוחר אופציה חדשה מהרשימה
  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    switchRole(newRole); // קוראים לפונקציה מהקונטקסט
  };

  // תרגום שמות התפקידים לעברית
  const translateRole = (role) => {
    switch (role) {
      case 'admin':
        return 'מנהל';
      case 'trainer':
        return 'מאמן';
      case 'member':
        return 'מתאמן';
      default:
        return role;
    }
  };

  return (
    <div className="role-switcher" style={{ marginLeft: '20px' }}>
      <label htmlFor="role-select" style={{ marginRight: '8px' }}>
        <strong>הצג בתור:</strong>
      </label>
      <select 
        id="role-select" 
        value={activeRole} 
        onChange={handleRoleChange}
        style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
      >
        {user.roles.map(role => (
          <option key={role} value={role}>
            {translateRole(role)}
          </option>
        ))}
      </select>
    </div>
  );
}

export default RoleSwitcher;