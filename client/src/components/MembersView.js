import React, { useState, useEffect } from 'react';
import api from '../services/api';
import UserModal from '../components/UserModal';
import '../styles/TrainersView.css'; 

function MembersView() {
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);

    const fetchMembers = async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await api.get('/api/users/all?role=member');
            setMembers(data);
        } catch (err) {
            setError(err.message || 'שגיאה בטעינת המתאמנים');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);
    
    const handleSave = () => {
        setEditingUser(null);
        setIsAddModalOpen(false);
        fetchMembers(); 
    };

    const handleDelete = async (memberId, memberName) => {
        if (confirmingDeleteId !== memberId) {
            setConfirmingDeleteId(memberId);
            setError(`האם למחוק את ${memberName}? לחץ שוב לאישור.`);
            return;
        }

        setError('');
        setIsLoading(true);
        try {
            await api.delete(`/api/users/${memberId}`);
            fetchMembers();
            setConfirmingDeleteId(null);
        } catch (err) {
            setError(err.message || 'שגיאה במחיקת המתאמן.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setConfirmingDeleteId(null);
        setError('');
    };
    
    const openAddModal = () => {
        setEditingUser(null);
        setIsAddModalOpen(true);
        setConfirmingDeleteId(null);
        setError('');
    };
    
    const openEditModal = (member) => {
        setIsAddModalOpen(false);
        setEditingUser(member);
        setConfirmingDeleteId(null);
        setError('');
    };
    
    const closeModal = () => {
        setEditingUser(null);
        setIsAddModalOpen(false);
        setConfirmingDeleteId(null);
        setError('');
    };

    const filteredMembers = members.filter(member => 
        member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading && members.length === 0) return <div className="loading">טוען מתאמנים...</div>;

    return (
        <div className="trainers-view-container">
            <div className="view-header">
                <h3>רשימת מתאמנים ({members.length})</h3>
                <input 
                    type="text"
                    placeholder="חפש לפי שם או אימייל..."
                    className="search-input"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <button className="btn btn-primary" onClick={openAddModal}>
                    + הוסף מתאמן
                </button>
            </div>
            
            {error && <p className={`error ${confirmingDeleteId ? 'confirm-message' : ''}`}>{error}</p>}

            <div className="trainers-grid">
                {filteredMembers.map(member => (
                    <div key={member.id} className="trainer-card">
                        <h4>{member.full_name}</h4>
                        <p>{member.email}</p>
                        <p>{member.phone}</p>
                        <div className="card-actions">
                            <button className="btn btn-secondary" onClick={() => openEditModal(member)}>
                                ערוך
                            </button>
                            <button 
                                className={`btn ${confirmingDeleteId === member.id ? 'btn-danger-confirm' : 'btn-danger'}`} 
                                onClick={() => handleDelete(member.id, member.full_name)}
                                disabled={isLoading && confirmingDeleteId === member.id}
                            >
                                {confirmingDeleteId === member.id ? 'לחץ לאישור' : 'מחק'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {(isAddModalOpen || editingUser) && (
                <UserModal 
                    user={editingUser}
                    defaultRole="member"
                    onClose={closeModal}
                    onSave={handleSave}
                />
            )}

            <button className="fab" onClick={openAddModal}>+</button>
        </div>
    );
}

export default MembersView;