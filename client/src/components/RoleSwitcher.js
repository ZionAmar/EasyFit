import React, { useState } from 'react';
import { useLocation } from 'react-router-dom'; // 1. מייבאים את Hook המיקום
import { useAuth } from '../context/AuthContext';
import '../styles/RoleSwitcher.css';

function RoleSwitcher() {
    const { activeStudio, activeRole, switchRole } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation(); // 2. מקבלים את המיקום הנוכחי

    if (!activeStudio || !activeStudio.roles || activeStudio.roles.length <= 1) {
        return null;
    }

    // 3. בודקים אם המיקום הנוכחי הוא הדף הבטוח להחלפה
    const isSwitchingAllowed = location.pathname === '/dashboard';

    const handleRoleChange = (newRole) => {
        if (isSwitchingAllowed) {
            switchRole(newRole);
        }
        setIsOpen(false);
    };

    const translateRole = (role) => {
        switch (role) {
            case 'admin': return 'מנהל';
            case 'trainer': return 'מאמן';
            case 'member': return 'מתאמן';
            default: return role;
        }
    };

    return (
        // 4. עוטפים את המתג ב-div כדי להוסיף tooltip וסגנון
        <div 
            className={`custom-select ${!isSwitchingAllowed ? 'disabled' : ''}`}
            title={isSwitchingAllowed ? 'החלף תצוגה' : 'ניתן להחליף תצוגה רק ממסך הדשבורד הראשי'}
        >
            <div 
                className="select-selected" 
                onClick={() => isSwitchingAllowed && setIsOpen(!isOpen)} // 5. מאפשרים פתיחה רק אם מותר
            >
                {translateRole(activeRole)}
            </div>
            <div className={`select-items ${isOpen ? '' : 'select-hide'}`}>
                {activeStudio.roles.map(role => (
                    <div 
                        key={role} 
                        className="select-item"
                        onClick={() => handleRoleChange(role)}
                    >
                        {translateRole(role)}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RoleSwitcher;