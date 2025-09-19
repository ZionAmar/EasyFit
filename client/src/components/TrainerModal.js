import React, { useState, useEffect } from 'react';
import api from '../services/api';

function TrainerModal({ trainer, onSave, onClose }) {
    const isEditMode = Boolean(trainer);
    // 1. Add 'roles' to the form's state
    const [formData, setFormData] = useState({
        full_name: '', email: '', phone: '', userName: '', pass: '', roles: [] 
    });
    // New state to hold all possible roles from the server
    const [allRoles, setAllRoles] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // 2. Fetch all possible roles when the modal opens
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
            // The server sends roles as a JSON string, so we need to parse it
            // and extract just the role names.
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

    // 3. New handler for checkbox changes
    const handleRoleChange = (roleName) => {
        const currentRoles = formData.roles || [];
        const newRoles = currentRoles.includes(roleName)
            ? currentRoles.filter(r => r !== roleName) // Remove role if it exists
            : [...currentRoles, roleName]; // Add role if it doesn't exist
        setFormData({ ...formData, roles: newRoles });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            if (isEditMode) {
                // The formData now includes the updated roles array
                await api.put(`/api/users/${trainer.id}`, formData);
            } else {
                // For a new user, set the default role to 'trainer'
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

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                <h2>{isEditMode ? 'Edit Trainer Details' : 'Add New Trainer'}</h2>
                <form onSubmit={handleSubmit} className="settings-form">
                    <div className="form-field">
                        <label>Full Name</label>
                        <input name="full_name" value={formData.full_name || ''} onChange={handleChange} required />
                    </div>
                    <div className="form-field">
                        <label>Username</label>
                        <input name="userName" value={formData.userName || ''} onChange={handleChange} required disabled={isEditMode}/>
                    </div>
                    <div className="form-field">
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email || ''} onChange={handleChange} required />
                    </div>
                    <div className="form-field">
                        <label>Phone</label>
                        <input name="phone" value={formData.phone || ''} onChange={handleChange} required />
                    </div>
                    <div className="form-field">
                        <label>{isEditMode ? 'New Password (Optional)' : 'Password'}</label>
                        <input type="password" name="pass" value={formData.pass || ''} onChange={handleChange} required={!isEditMode} />
                    </div>
                    
                    {/* --- 4. New section for roles (only in edit mode) --- */}
                    {isEditMode && (
                        <div className="form-field">
                            <label>Roles</label>
                            <div className="roles-checkbox-group">
                                {allRoles.map(role => (
                                    <div key={role.id} className="checkbox-item">
                                        <input 
                                            type="checkbox"
                                            id={`role-${role.id}`}
                                            checked={(formData.roles || []).includes(role.name)}
                                            onChange={() => handleRoleChange(role.name)}
                                        />
                                        <label htmlFor={`role-${role.id}`}>{role.name}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {error && <p className="error">{error}</p>}

                    <button type="submit" className="cta-button-pro" disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default TrainerModal;