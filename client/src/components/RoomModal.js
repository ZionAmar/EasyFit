import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/UserModal.css'; 

function RoomModal({ room, onSave, onClose }) {
    const isEditMode = Boolean(room);
    const [formData, setFormData] = useState({
        name: '', capacity: 10, is_available: true, has_equipment: false
    });
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            setFormData({
                name: room.name,
                capacity: room.capacity,
                is_available: room.is_available === 1,
                has_equipment: room.has_equipment === 1,
            });
        }
    }, [room, isEditMode]);

    const resetErrors = () => {
        setError('');
        setFieldErrors({});
    };

    const handleChange = (e) => {
        resetErrors();
        const { name, value, type, checked } = e.target;
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: null }));
        }
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        resetErrors();
        try {
            const payload = {
                ...formData,
                capacity: parseInt(formData.capacity),
            };
            if (isEditMode) {
                await api.put(`/api/rooms/${room.id}`, payload);
            } else {
                await api.post('/api/rooms', payload);
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

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isEditMode ? 'עריכת חדר' : 'הוספת חדר חדש'}</h2>
                    <button className="modal-close-btn" onClick={onClose}>&times;</button>
                </div>
                
                <form id="room-form" onSubmit={handleSubmit} className="user-form">
                    <fieldset disabled={isLoading}>
                        <div className="form-field">
                            <label>שם החדר</label>
                            <input name="name" value={formData.name} onChange={handleChange} required />
                            {fieldErrors.name && <p className="error field-error">{fieldErrors.name}</p>}
                        </div>
                        <div className="form-field">
                            <label>קיבולת מתאמנים</label>
                            <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} required min="1" />
                            {fieldErrors.capacity && <p className="error field-error">{fieldErrors.capacity}</p>}
                        </div>
                        <div className="form-field checkbox-row">
                            <input type="checkbox" id="is_available" name="is_available" checked={formData.is_available} onChange={handleChange} />
                            <label htmlFor="is_available">החדר זמין לשימוש</label>
                        </div>
                        <div className="form-field checkbox-row">
                            <input type="checkbox" id="has_equipment" name="has_equipment" checked={formData.has_equipment} onChange={handleChange} />
                            <label htmlFor="has_equipment">מכיל ציוד</label>
                        </div>
                        {error && !Object.values(fieldErrors).some(e => e) && <p className="error">{error}</p>}
                    </fieldset>
                </form>

                <div className="modal-actions">
                    <button type="submit" form="room-form" className="cta-button-pro" disabled={isLoading}>
                        {isLoading ? 'שומר...' : 'שמור'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default RoomModal;