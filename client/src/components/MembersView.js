import React, { useState, useEffect } from 'react';
import api from '../services/api';
import MemberModal from './MemberModal';
import '../styles/TrainersView.css'; 

function MembersView() {
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingMember, setEditingMember] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    const [searchTerm, setSearchTerm] = useState('');

    const fetchMembers = async () => {
        setIsLoading(true);
        try {
            const data = await api.get('/api/users?role=member');
            setMembers(data);
        } catch (err) {
            setError('שגיאה בטעינת המתאמנים');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);
    
    const handleSave = () => {
        setEditingMember(null);
        setIsAddModalOpen(false);
        fetchMembers(); 
    };

    const handleDelete = async (memberId, memberName) => {
        if (window.confirm(`האם אתה בטוח שברצונך למחוק את ${memberName}?`)) {
            try {
                await api.delete(`/api/users/${memberId}`);
                fetchMembers(); // Refresh the list after deleting
            } catch (err) {
                setError(err.message || 'שגיאה במחיקת המתאמן.');
            }
        }
    };

    const filteredMembers = members.filter(member => 
        member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <div className="loading">טוען מתאמנים...</div>;
    if (error) return <div className="error-state">{error}</div>;

    return (
        <div className="trainers-view-container">
            <div className="view-header">
                <h3>רשימת מתאמנים</h3>
                <input 
                    type="text"
                    placeholder="חפש לפי שם או אימייל..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="cta-button-pro" onClick={() => setIsAddModalOpen(true)}>
                    + הוסף מתאמן
                </button>
            </div>
            
            <div className="trainers-grid">
                {filteredMembers.map(member => (
                    <div key={member.id} className="trainer-card">
                        <h4>{member.full_name}</h4>
                        <p>{member.email}</p>
                        <p>{member.phone}</p>
                        <div className="card-actions">
                            <button className="edit-btn" onClick={() => setEditingMember(member)}>
                                ערוך
                            </button>
                            <button className="delete-btn" onClick={() => handleDelete(member.id, member.full_name)}>
                                מחק
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {(isAddModalOpen || editingMember) && (
                <MemberModal 
                    member={editingMember}
                    onClose={() => { setEditingMember(null); setIsAddModalOpen(false); }}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}

export default MembersView;