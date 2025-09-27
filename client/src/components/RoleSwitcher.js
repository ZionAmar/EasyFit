import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function RoleSwitcher() {
    const { activeStudio, activeRole, switchRole } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    if (!activeStudio || !activeStudio.roles || activeStudio.roles.length <= 1) {
        return null;
    }

    const handleRoleChange = (newRole) => {
        switchRole(newRole);
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
        <div className="custom-select">
            <div className="select-selected" onClick={() => setIsOpen(!isOpen)}>
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