import React, { useState, useEffect } from 'react';
import api from '../services/api';
import MemberModal from './MemberModal';
// We can reuse the same CSS file from the Trainers view for consistency
import '../styles/TrainersView.css'; 

function MembersView() {
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingMember, setEditingMember] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const fetchMembers = async () => {
        setIsLoading(true);
        try {
            // The only change from TrainersView is the role parameter
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
        fetchMembers(); // Refetch the list after saving
    };

    if (isLoading) return <div className="loading">טוען מתאמנים...</div>;
    if (error) return <div className="error-state">{error}</div>;

    return (
        <div className="trainers-view-container">
            <div className="view-header">
                <h3>רשימת מתאמנים</h3>
                <button className="cta-button-pro" onClick={() => setIsAddModalOpen(true)}>
                    + הוסף מתאמן
                </button>
            </div>
            
            <div className="trainers-grid">
                {members.map(member => (
                    <div key={member.id} className="trainer-card">
                        <h4>{member.full_name}</h4>
                        <p>{member.email}</p>
                        <p>{member.phone}</p>
                        <button className="edit-btn" onClick={() => setEditingMember(member)}>
                            ערוך
                        </button>
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