import React from 'react';
import { useAuth } from '../context/AuthContext';

function RoleSwitcher() {
    const { activeStudio, activeRole, switchRole } = useAuth();

    if (!activeStudio || !activeStudio.roles || activeStudio.roles.length <= 1) {
        return null;
    }

    const handleRoleChange = (e) => {
        const newRole = e.target.value;
        switchRole(newRole);
    };

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
        <div className="role-switcher">
            <label htmlFor="role-select">תצוגת:</label>
            <select
                id="role-select"
                value={activeRole || ''}
                onChange={handleRoleChange}
                className="role-select"
            >
                {activeStudio.roles.map(role => (
                    <option key={role} value={role}>
                        {translateRole(role)}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default RoleSwitcher;