import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/UserModal.css';

function TrainerModal({ trainer, onSave, onClose }) {
    const isEditMode = Boolean(trainer);
    const [formData, setFormData] = useState({
        full_name: '', email: '', phone: '', userName: '', pass: '', roles: [] 
    });
    const [allRoles, setAllRoles] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const rolesData = await api.get('/api/roles');
                setAllRoles(rolesData);
            } catch (err) {
                console.error("Failed to fetch roles", err);
            }
        };
        fetchRoles();

        if (isEditMode) {
            let rolesNames = [];
            if (trainer.roles) {
                try {
                    const parsedRoles = JSON.parse(trainer.roles);
                    if (Array.isArray(parsedRoles)) {
                        rolesNames = parsedRoles.map(r => r.role);
                    }
                } catch (e) {
                    console.error("Failed to parse roles JSON", e);
                }
            }
            setFormData({ ...trainer, pass: '', roles: rolesNames });
        }
    }, [trainer, isEditMode]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleChange = (roleName) => {
        const currentRoles = formData.roles || [];
        const newRoles = currentRoles.includes(roleName)
            ? currentRoles.filter(r => r !== roleName)
            : [...currentRoles, roleName];
        setFormData({ ...formData, roles: newRoles });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            if (isEditMode) {
                await api.put(`/api/users/${trainer.id}`, formData);
            } else {
                const payload = { ...formData, roles: ['trainer'] };
                await api.post('/api/users', payload);
            }
            onSave();
        } catch (err) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm(`האם אתה בטוח שברצונך למחוק את ${formData.full_name}? לא ניתן לבטל פעולה זו.`)) {
            setIsLoading(true);
            try {
                await api.delete(`/api/users/${trainer.id}`);
                onSave();
            } catch (err) {
                setError(err.message || 'שגיאה במחיקת המאמן.');
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isEditMode ? 'עריכת פרטי מאמן' : 'הוספת מאמן חדש'}</h2>
                    <button className="modal-close-btn" onClick={onClose}>&times;</button>
                </div>
                
                <form id="user-form" onSubmit={handleSubmit} className="user-form">
                    <div className="form-field">
                        <label>שם מלא</label>
                        <input name="full_name" value={formData.full_name || ''} onChange={handleChange} required />
                    </div>
                    <div className="form-field">
                        <label>שם משתמש</label>
                        <input name="userName" value={formData.userName || ''} onChange={handleChange} required disabled={isEditMode}/>
                    </div>
                    <div className="form-field">
                        <label>אימייל</label>
                        <input type="email" name="email" value={formData.email || ''} onChange={handleChange} required />
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
                                {allRoles.map(role => (
                                    <div key={role.id} className="checkbox-item">
                                        <input type="checkbox" id={`role-${role.name}-${trainer.id}`} checked={(formData.roles || []).includes(role.name)} onChange={() => handleRoleChange(role.name)} />
                                        <label htmlFor={`role-${role.name}-${trainer.id}`}>{role.name}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {error && <p className="error">{error}</p>}

                    {isEditMode && (
                        <div className="danger-zone">
                            <h4>אזור סכנה</h4>
                            <p>מחיקת משתמש היא פעולה קבועה. הפעולה תסיר את הפרופיל וכל המידע המשויך אליו.</p>
                            <button type="button" className="delete-btn" onClick={handleDelete} disabled={isLoading}>
                                מחק מאמן
                            </button>
                        </div>
                    )}
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

export default TrainerModal;