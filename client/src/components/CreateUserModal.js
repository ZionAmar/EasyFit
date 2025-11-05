import React, { useState } from 'react';
import api from '../services/api';
import '../styles/UserModal.css'; 

function CreateUserModal({ onClose, onSave }) {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        userName: '',
        pass: '',
        phone: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const handleChange = (e) => {
        setError('');
        if (fieldErrors[e.target.name]) {
            setFieldErrors(prev => ({ ...prev, [e.target.name]: null }));
        }
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setFieldErrors({});
        try {
            await api.post('/api/users/system/create', formData);
            onSave();
            onClose();
        } catch (err) {
            const serverResponse = err.response?.data;
            
            if (serverResponse && serverResponse.field) {
                setFieldErrors({ [serverResponse.field]: serverResponse.message });
                setError('');
            } else {
                setError(err.message || "שגיאה ביצירת המשתמש.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close-btn" onClick={onClose} disabled={isLoading}>&times;</button>
                <h2>יצירת משתמש חדש</h2>
                <form onSubmit={handleSubmit} className="settings-form">
                    <fieldset disabled={isLoading}>
                        <div className="form-field">
                            <label>שם מלא</label>
                            <input name="full_name" value={formData.full_name} onChange={handleChange} required />
                        </div>
                        <div className="form-field">
                            <label>אימייל</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                            {fieldErrors.email && <p className="error field-error">{fieldErrors.email}</p>}
                        </div>
                        <div className="form-field">
                            <label>שם משתמש</label>
                            <input name="userName" value={formData.userName} onChange={handleChange} required />
                            {fieldErrors.userName && <p className="error field-error">{fieldErrors.userName}</p>}
                        </div>
                        <div className="form-field">
                            <label>סיסמה</label>
                            <input type="password" name="pass" value={formData.pass} onChange={handleChange} required />
                        </div>
                        <div className="form-field">
                            <label>טלפון (אופציונלי)</label>
                            <input name="phone" value={formData.phone} onChange={handleChange} />
                        </div>
                    </fieldset>
                    
                    {error && !Object.values(fieldErrors).some(e => e) && <p className="error" style={{marginTop: '1rem'}}>{error}</p>}
                    
                    <div className="modal-actions" style={{marginTop: '1.5rem'}}>
                        <button type="submit" className="btn btn-primary" disabled={isLoading}>{isLoading ? 'יוצר...' : 'צור משתמש'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateUserModal;