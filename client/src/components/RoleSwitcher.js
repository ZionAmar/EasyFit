import React from 'react';
import { useAuth } from '../context/AuthContext'; // ודא שהנתיב לקונטקסט נכון

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
    <div className="role-switcher" style={{ display: 'flex', alignItems: 'center' }}>
      <label htmlFor="role-select" style={{ marginRight: '8px', marginLeft: '8px', whiteSpace: 'nowrap' }}>
        <strong>מחובר בתור:</strong>
      </label>
      <select
        id="role-select"
        value={activeRole}
        onChange={handleRoleChange}
        style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc', background: 'transparent' }}
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
