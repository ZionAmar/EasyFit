import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/UserModal.css';

function ProfileModal({ isOpen, onClose }) {
    const { user, refreshUser } = useAuth(); 
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        profile_picture_url: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                phone: user.phone || '',
                profile_picture_url: user.profile_picture_url || ''
            });
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await api.put('/api/users/profile', formData);
            if (refreshUser) {
                await refreshUser();
            }
            onClose(); 
        } catch (err) {
            setError(err.message || 'שגיאה בעדכון הפרופיל.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                <h2>עריכת פרופיל</h2>
                <form onSubmit={handleSave} className="settings-form">
                    <div className="form-field">
                        <label>שם מלא</label>
                        <input
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-field">
                        <label>אימייל (לא ניתן לעריכה)</label>
                        <input
                            type="email"
                            value={user.email || ''}
                            disabled
                            title="לא ניתן לשנות את כתובת האימייל"
                        />
                    </div>
                    <div className="form-field">
                        <label>טלפון</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-field">
                        <label>כתובת URL לתמונת פרופיל</label>
                        <input
                            type="text"
                            name="profile_picture_url"
                            placeholder="הדבק כאן קישור לתמונה"
                            value={formData.profile_picture_url}
                            onChange={handleChange}
                        />
                    </div>

                    {error && <p className="error">{error}</p>}
                    
                    <div className="modal-actions">
                        <button type="submit" className="btn register-btn" disabled={isLoading}>
                            {isLoading ? 'שומר...' : 'שמור שינויים'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProfileModal;
