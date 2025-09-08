import React, { useState, useEffect } from 'react';
import api from '../services/api';

function MemberModal({ member, onSave, onClose }) {
    const isEditMode = Boolean(member);
    const [formData, setFormData] = useState({
        full_name: '', email: '', phone: '', userName: '', pass: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            setFormData({ ...member, pass: '' }); // Don't pre-fill password
        }
    }, [member, isEditMode]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            if (isEditMode) {
                await api.put(`/api/users/${member.id}`, formData);
            } else {
                // For a new member, send the role 'member'
                const payload = { ...formData, roles: ['member'] };
                await api.post('/api/users', payload);
            }
            onSave(); // Trigger refetch in the parent component
        } catch (err) {
            setError(err.message || 'אירעה שגיאה');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                <h2>{isEditMode ? 'עריכת פרטי מתאמן' : 'הוספת מתאמן חדש'}</h2>
                <form onSubmit={handleSubmit} className="settings-form">
                    <div className="form-field">
                        <label>שם מלא</label>
                        <input name="full_name" value={formData.full_name} onChange={handleChange} required />
                    </div>
                    <div className="form-field">
                        <label>שם משתמש</label>
                        <input name="userName" value={formData.userName} onChange={handleChange} required disabled={isEditMode}/>
                    </div>
                    <div className="form-field">
                        <label>אימייל</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="form-field">
                        <label>טלפון</label>
                        <input name="phone" value={formData.phone} onChange={handleChange} required />
                    </div>
                    <div className="form-field">
                        <label>{isEditMode ? 'סיסמה חדשה (אופציונלי)' : 'סיסמה'}</label>
                        <input type="password" name="pass" value={formData.pass} onChange={handleChange} required={!isEditMode} />
                    </div>
                    
                    {error && <p className="error">{error}</p>}

                    <button type="submit" className="cta-button-pro" disabled={isLoading}>
                        {isLoading ? 'שומר...' : 'שמור'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default MemberModal;