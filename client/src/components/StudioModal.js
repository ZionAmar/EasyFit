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
    
    const [createMode, setCreateMode] = useState('newAdmin');
    const [allUsers, setAllUsers] = useState([]);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [selectedExistingAdminId, setSelectedExistingAdminId] = useState('');
    const [currentAdmin, setCurrentAdmin] = useState(null);
    const [selectedNewAdminId, setSelectedNewAdminId] = useState('');

    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                const users = await api.get('/api/users/all'); 
                setAllUsers(users || []);
            } catch (err) { console.error("Failed to fetch all users", err); }
        };
        
        // Fetch all users for both Create and Edit modes
        fetchAllUsers();

        if (isEditMode && studio) {
            setFormData({
                name: studio.name || '',
                address: studio.address || '',
                phone_number: studio.phone_number || '',
                subscription_status: studio.subscription_status || 'trialing',
            });

            const fetchStudioAdmin = async () => {
                try {
                    const usersInStudio = await api.get(`/api/users/by-studio/${studio.id}`);
                    const adminUser = usersInStudio.find(u => 
                        u.roles && JSON.parse(u.roles).some(r => r.studio_id === studio.id && r.role === 'admin')
                    );
                    setCurrentAdmin(adminUser);
                } catch (err) { console.error("Failed to fetch studio admin", err); }
            };
            fetchStudioAdmin();
        }
    }, [studio, isEditMode]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            if (isEditMode) {
                const { name, address, phone_number, subscription_status } = formData;
                await api.put(`/api/studio/${studio.id}`, { name, address, phone_number, subscription_status });
            } else {
                const payload = {
                    createMode,
                    name: formData.name,
                    address: formData.address,
                    phone_number: formData.phone_number,
                };
                if (createMode === 'newAdmin') {
                    payload.admin_full_name = formData.admin_full_name;
                    payload.admin_email = formData.admin_email;
                    payload.admin_userName = formData.admin_userName;
                    payload.admin_password = formData.admin_password;
                } else {
                    if (!selectedExistingAdminId) throw new Error("אנא בחר משתמש קיים מהרשימה.");
                    payload.existingAdminId = selectedExistingAdminId;
                }
                await api.post('/api/studio', payload);
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

    const filteredUsers = allUsers.filter(user =>
        user.full_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
    );

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                <h2>{isEditMode ? `עריכת סטודיו: ${studio.name}` : 'הוספת סטודיו חדש'}</h2>
                
                <form onSubmit={handleSubmit} className="settings-form">
                    <fieldset>
                        <legend>פרטי הסטודיו</legend>
                        <div className="form-field"><label>שם הסטודיו</label><input name="name" value={formData.name} onChange={handleChange} required disabled={isLoading}/></div>
                        <div className="form-field"><label>כתובת</label><input name="address" value={formData.address} onChange={handleChange} disabled={isLoading}/></div>
                        <div className="form-field"><label>מספר טלפון</label><input name="phone_number" value={formData.phone_number} onChange={handleChange} disabled={isLoading}/></div>
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
                        <>
                            <div className="create-mode-toggle" style={{ display: 'flex', gap: '10px', margin: '1.5rem 0' }}>
                                <button type="button" className={`btn ${createMode === 'newAdmin' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setCreateMode('newAdmin')}>צור מנהל חדש</button>
                                <button type="button" className={`btn ${createMode === 'existingUser' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setCreateMode('existingUser')}>בחר משתמש קיים</button>
                            </div>

                            {createMode === 'newAdmin' && (
                                <fieldset>
                                    <legend>פרטי מנהל חדש</legend>
                                    <div className="form-field"><label>שם מלא</label><input name="admin_full_name" value={formData.admin_full_name} onChange={handleChange} required={createMode === 'newAdmin'} disabled={isLoading}/></div>
                                    <div className="form-field"><label>שם משתמש</label><input name="admin_userName" value={formData.admin_userName} onChange={handleChange} required={createMode === 'newAdmin'} disabled={isLoading}/></div>
                                    <div className="form-field"><label>אימייל</label><input name="admin_email" type="email" value={formData.admin_email} onChange={handleChange} required={createMode === 'newAdmin'} disabled={isLoading}/></div>
                                    <div className="form-field"><label>סיסמה</label><input name="admin_password" type="password" value={formData.admin_password} onChange={handleChange} required={createMode === 'newAdmin'} disabled={isLoading}/></div>
                                </fieldset>
                            )}

                            {createMode === 'existingUser' && (
                                <fieldset>
                                    <legend>בחר מנהל מהרשימה</legend>
                                    <div className="form-field">
                                        <input type="text" placeholder="חפש משתמש..." className="search-input-modal" value={userSearchTerm} onChange={(e) => setUserSearchTerm(e.target.value)} />
                                    </div>
                                    <div className="form-field">
                                        <label>בחר משתמש</label>
                                        <select value={selectedExistingAdminId} onChange={(e) => setSelectedExistingAdminId(e.target.value)} required={createMode === 'existingUser'} disabled={isLoading}>
                                            <option value="">בחר...</option>
                                            {filteredUsers.map(user => (
                                                <option key={user.id} value={user.id}>{user.full_name} ({user.email})</option>
                                            ))}
                                        </select>
                                    </div>
                                </fieldset>
                            )}
                        </>
                    )}
                    
                    {error && <p className="error">{error}</p>}
                    <div className="modal-actions">
                         <button type="submit" className="btn btn-primary" disabled={isLoading}>{isLoading ? 'שומר...' : 'שמור'}</button>
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
                                {allUsers.filter(u => u.id !== currentAdmin?.id).map(user => (
                                    <option key={user.id} value={user.id}>{user.full_name} ({user.email})</option>
                                ))}
                            </select>
                        </div>
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