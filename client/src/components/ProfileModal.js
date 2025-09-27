import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/UserModal.css';

function ProfileModal({ isOpen, onClose }) {
    const { user, refreshUser } = useAuth();
    const [formData, setFormData] = useState({ full_name: '', phone: '' });
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef();

    useEffect(() => {
        if (user && isOpen) {
            setFormData({
                full_name: user.full_name || '',
                phone: user.phone || '',
            });
            setPreview(user.profile_picture_url || null);
            setSelectedFile(null); 
        }
    }, [user, isOpen]);

    useEffect(() => {
        if (!selectedFile) {
            setPreview(user?.profile_picture_url || null);
            return;
        }
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile, user]);


    if (!isOpen) return null;

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const data = new FormData();
        data.append('full_name', formData.full_name);
        data.append('phone', formData.phone);
        if (selectedFile) {
            data.append('profile_picture', selectedFile);
        }

        try {
            await api.put('/api/users/profile', data);

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
                    <div className="form-field profile-picture-field">
                        <label>תמונת פרופיל</label>
                        <div className="profile-picture-preview" onClick={() => fileInputRef.current.click()}>
                            {preview ? (
                                <img src={preview} alt="תצוגה מקדימה" />
                            ) : (
                                <div className="placeholder-avatar">{user?.full_name?.charAt(0)}</div>
                            )}
                            <div className="upload-overlay">לחץ לשינוי</div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            accept="image/*"
                        />
                    </div>
                    <div className="form-field">
                        <label>שם מלא</label>
                        <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required />
                    </div>
                    <div className="form-field">
                        <label>טלפון</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
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
