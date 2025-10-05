import React, { useState, useEffect } from 'react';
import api from '../services/api';

function StudioModal({ studio, onClose, onSave }) {
    const isEditMode = Boolean(studio);
    const [formData, setFormData] = useState({
        name: '', address: '', phone_number: '', subscription_status: 'trialing',
        admin_full_name: '', admin_email: '', admin_userName: '', admin_password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [studioUsers, setStudioUsers] = useState([]);
    const [currentAdmin, setCurrentAdmin] = useState(null);
    const [selectedNewAdminId, setSelectedNewAdminId] = useState('');

    useEffect(() => {
        if (isEditMode && studio) {
            setFormData({
                name: studio.name || '',
                address: studio.address || '',
                phone_number: studio.phone_number || '',
                subscription_status: studio.subscription_status || 'trialing',
            });

            const fetchStudioUsers = async () => {
                try {
                    const users = await api.get(`/api/users/by-studio/${studio.id}`);
                    setStudioUsers(users || []);
                    const adminUser = users.find(u => 
                        u.roles && JSON.parse(u.roles).some(r => r.studio_id === studio.id && r.role === 'admin')
                    );
                    setCurrentAdmin(adminUser);
                } catch (err) { console.error("Failed to fetch studio users", err); }
            };
            fetchStudioUsers();
        }
    }, [studio, isEditMode]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleStudioDetailsSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            if (isEditMode) {
                const { name, address, phone_number, subscription_status } = formData;
                await api.put(`/api/studio/${studio.id}`, { name, address, phone_number, subscription_status });
            } else {
                await api.post('/api/studio', formData);
            }
            onSave();
        } catch (err) {
            setError(err.response?.data?.message || 'שגיאה בשמירת פרטי הסטודיו.');
            setIsLoading(false);
        }
    };
    
    const handleAssignNewAdmin = async () => {
        if (!selectedNewAdminId) return alert('אנא בחר מנהל חדש מהרשימה.');
        if (window.confirm(`האם להפוך את המשתמש הנבחר למנהל הראשי של ${studio.name}?`)) {
            setIsLoading(true);
            setError('');
            try {
                await api.put(`/api/studio/${studio.id}/assign-admin`, { newAdminId: selectedNewAdminId });
                onSave();
            } catch (err) {
                setError(err.response?.data?.message || 'שגיאה בהחלפת המנהל.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                <h2>{isEditMode ? `עריכת סטודיו: ${studio.name}` : 'הוספת סטודיו ומנהל ראשי'}</h2>
                
                <form onSubmit={handleStudioDetailsSubmit} className="settings-form">
                    <fieldset>
                        <legend>פרטי הסטודיו</legend>
                        <div className="form-field">
                            <label>שם הסטודיו</label>
                            <input name="name" value={formData.name} onChange={handleChange} required disabled={isLoading} />
                        </div>
                        <div className="form-field">
                            <label>כתובת</label>
                            <input name="address" value={formData.address} onChange={handleChange} disabled={isLoading} />
                        </div>
                        <div className="form-field">
                            <label>מספר טלפון</label>
                            <input name="phone_number" value={formData.phone_number} onChange={handleChange} disabled={isLoading} />
                        </div>
                        {isEditMode && (
                            <div className="form-field">
                                <label>סטטוס מנוי</label>
                                <select name="subscription_status" value={formData.subscription_status} onChange={handleChange} disabled={isLoading}>
                                    <option value="trialing">בתקופת ניסיון</option>
                                    <option value="active">פעיל</option>
                                    <option value="past_due">בפיגור תשלום</option>
                                    <option value="canceled">בוטל</option>
                                </select>
                            </div>
                        )}
                    </fieldset>

                    {!isEditMode && (
                        <fieldset>
                            <legend>פרטי מנהל הסטודיו</legend>
                            <div className="form-field">
                                <label>שם מלא</label>
                                <input name="admin_full_name" value={formData.admin_full_name} onChange={handleChange} required disabled={isLoading} />
                            </div>
                            <div className="form-field">
                                <label>שם משתמש (באנגלית)</label>
                                <input name="admin_userName" value={formData.admin_userName} onChange={handleChange} required disabled={isLoading} />
                            </div>
                            <div className="form-field">
                                <label>אימייל</label>
                                <input name="admin_email" type="email" value={formData.admin_email} onChange={handleChange} required disabled={isLoading} />
                            </div>
                            <div className="form-field">
                                <label>סיסמה</label>
                                <input name="admin_password" type="password" value={formData.admin_password} onChange={handleChange} required disabled={isLoading} />
                            </div>
                        </fieldset>
                    )}
                    
                    {error && !isEditMode && <p className="error">{error}</p>}
                    <div className="modal-actions">
                         <button type="submit" className="btn btn-primary" disabled={isLoading}>
                            {isLoading ? 'שומר...' : (isEditMode ? 'שמור פרטי סטודיו' : 'צור סטודיו ומנהל')}
                        </button>
                    </div>
                </form>

                {isEditMode && (
                    <div className="admin-management-section">
                        <hr />
                        <h4>ניהול מנהל הסטודיו</h4>
                        <p><strong>מנהל נוכחי:</strong> {currentAdmin ? `${currentAdmin.full_name} (${currentAdmin.email})` : 'טוען...'}</p>
                        <div className="form-field">
                            <label>החלף מנהל למשתמש קיים:</label>
                            <select value={selectedNewAdminId} onChange={(e) => setSelectedNewAdminId(e.target.value)} disabled={isLoading}>
                                <option value="">בחר משתמש...</option>
                                {studioUsers.filter(u => u.id !== currentAdmin?.id).map(user => (
                                    <option key={user.id} value={user.id}>{user.full_name}</option>
                                ))}
                            </select>
                        </div>
                        {error && <p className="error">{error}</p>}
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={handleAssignNewAdmin} disabled={!selectedNewAdminId || isLoading}>
                                {isLoading ? 'מעדכן...' : 'הפוך למנהל'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default StudioModal;