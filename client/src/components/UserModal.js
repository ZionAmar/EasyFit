import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/UserModal.css';

function UserModal({ user, onSave, onClose, defaultRole }) {
    const { activeStudio } = useAuth();
    const isEditMode = Boolean(user);
    const [formData, setFormData] = useState({
        full_name: '', email: '', phone: '', userName: '', pass: '', roles: []
    });
    const [assignableRoles, setAssignableRoles] = useState([]);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const rolesData = await api.get('/api/users/assignable-roles'); 
                setAssignableRoles(rolesData);
            } catch (err) {
                setError("שגיאה בטעינת רשימת התפקידים.");
            }
        };
        fetchRoles();

        if (isEditMode && user && activeStudio) {
            let rolesArray = [];
            if (typeof user.roles === 'string') {
                try {
                    rolesArray = JSON.parse(user.roles);
                } catch (e) { 
                    console.error("Failed to parse roles JSON string:", user.roles);
                    rolesArray = [];
                }
            } else if (Array.isArray(user.roles)) {
                rolesArray = user.roles;
            }

            const rolesForCurrentStudio = rolesArray
                .filter(r => r && r.studio_id === activeStudio.studio_id)
                .map(r => r.role || r.role_name)
                .filter(Boolean);

            setFormData({ ...user, pass: '', roles: rolesForCurrentStudio });
        } else {
            setFormData({
                full_name: '', email: '', phone: '', userName: '', pass: '', 
                roles: [defaultRole]
            });
        }
    }, [user, isEditMode, activeStudio, defaultRole]);

    const resetErrors = () => {
        setError('');
        setFieldErrors({});
        setIsConfirmingDelete(false);
    };

    const handleChange = (e) => {
        resetErrors();
        if (fieldErrors[e.target.name]) {
            setFieldErrors(prev => ({ ...prev, [e.target.name]: null }));
        }
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleChange = (roleName) => {
        resetErrors();
        const currentRoles = formData.roles || [];
        const newRoles = currentRoles.includes(roleName)
            ? currentRoles.filter(r => r !== roleName)
            : [...currentRoles, roleName];
        setFormData({ ...formData, roles: newRoles });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        resetErrors();
        try {
            if (isEditMode) {
                await api.put(`/api/users/${user.id}`, formData);
            } else {
                const payload = { ...formData, roles: [defaultRole] };
                await api.post('/api/users', payload);
            }
            onSave();
        } catch (err) {
            const serverResponse = err.response?.data;
            if (serverResponse && serverResponse.field) {
                setFieldErrors({ [serverResponse.field]: serverResponse.message });
            } else {
                setError(err.message || 'An error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!isConfirmingDelete) {
            resetErrors();
            setIsConfirmingDelete(true);
            setError(`האם אתה בטוח שברצונך למחוק את ${formData.full_name}? לחץ שוב לאישור.`);
            return;
        }

        setIsLoading(true);
        resetErrors();
        try {
            await api.delete(`/api/users/${user.id}`);
            onSave();
        } catch (err) {
            setError(err.message || 'שגיאה במחיקת המשתמש.');
            setIsLoading(false);
        }
    };

    const title = isEditMode 
        ? (defaultRole === 'trainer' ? 'עריכת פרטי מאמן' : 'עריכת פרטי מתאמן')
        : (defaultRole === 'trainer' ? 'הוספת מאמן חדש' : 'הוספת מתאמן חדש');
        
    const deleteButtonText = defaultRole === 'trainer' ? 'מחק מאמן' : 'מחק מתאמן';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="modal-close-btn" onClick={onClose}>&times;</button>
                </div>
                
                <form id="user-form" onSubmit={handleSubmit} className="user-form">
                    <fieldset disabled={isLoading}>
                        <div className="form-field">
                            <label>שם מלא</label>
                            <input name="full_name" value={formData.full_name || ''} onChange={handleChange} required />
                        </div>
                        <div className="form-field">
                            <label>שם משתמש</label>
                            <input name="userName" value={formData.userName || ''} onChange={handleChange} required disabled={isEditMode}/>
                            {fieldErrors.userName && <p className="error field-error">{fieldErrors.userName}</p>}
                        </div>
                        <div className="form-field">
                            <label>אימייל</label>
                            <input type="email" name="email" value={formData.email || ''} onChange={handleChange} required />
                            {fieldErrors.email && <p className="error field-error">{fieldErrors.email}</p>}
                        </div>
                        <div className="form-field">
                            <label>טלפון</label>
                            <input name="phone" value={formData.phone || ''} onChange={handleChange} required />
                        </div>
                        <div className="form-field">
                            <label>{isEditMode ? 'סיסמה חדשה (אופציונלי)' : 'סיסמה'}</label>
                            <input type="password" name="pass" value={formData.pass || ''} onChange={handleChange} required={!isEditMode} />
                        </div>

                        {isEditMode && (
                            <div className="form-field">
                                <label>תפקידים</label>
                                <div className="roles-checkbox-group">
                                    {assignableRoles.map(role => (
                                        <div key={role.id} className="checkbox-item">
                                            <input 
                                                type="checkbox" 
                                                id={`role-${role.name}-${user.id}`} 
                                                checked={(formData.roles || []).includes(role.name)} 
                                                onChange={() => handleRoleChange(role.name)} 
                                            />
                                            <label htmlFor={`role-${role.name}-${user.id}`}>{role.name}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {error && <p className={`error ${isConfirmingDelete ? 'confirm-message' : ''}`}>{error}</p>}
                        {isEditMode && (
                            <div className="danger-zone">
                                <h4>אזהרה</h4>
                                <p>מחיקת משתמש היא פעולה קבועה. הפעולה תסיר את הפרופיל וכל המידע המשויך אליו.</p>
                                <button 
                                    type="button" 
                                    className={`btn ${isConfirmingDelete ? 'btn-danger-confirm' : 'btn-danger'}`} 
                                    onClick={handleDelete} 
                                    disabled={isLoading}
                                >
                                    {isConfirmingDelete ? 'לחץ לאישור מחיקה' : deleteButtonText}
                                </button>
                            </div>
                        )}
                    </fieldset>
                </form>

                <div className="modal-actions">
                    <button type="submit" form="user-form" className="cta-button-pro" disabled={isLoading}>
                        {isLoading ? 'שומר...' : 'שמור שינויים'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UserModal;