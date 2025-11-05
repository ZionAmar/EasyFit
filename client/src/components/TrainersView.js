import React, { useState, useEffect } from 'react';
import api from '../services/api';
import UserModal from '../components/UserModal';
import '../styles/TrainersView.css';

function TrainersView() {
    const [trainers, setTrainers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);

    const fetchTrainers = async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await api.get('/api/users/all?role=trainer');
            setTrainers(data);
        } catch (err) {
            setError(err.message || 'שגיאה בטעינת המאמנים');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTrainers();
    }, []);
    
    const handleSave = () => {
        setEditingUser(null);
        setIsAddModalOpen(false);
        fetchTrainers();
    };

    const handleDelete = async (userId, userName) => {
        if (confirmingDeleteId !== userId) {
            setConfirmingDeleteId(userId);
            setError(`האם למחוק את ${userName}? לחץ שוב לאישור.`);
            return;
        }
        
        setError('');
        setIsLoading(true);
        try {
            await api.delete(`/api/users/${userId}`);
            fetchTrainers();
            setConfirmingDeleteId(null);
        } catch (err) {
            setError(err.message || 'שגיאה במחיקת המאמן.');
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

    const openEditModal = (trainer) => {
        setIsAddModalOpen(false);
        setEditingUser(trainer);
        setConfirmingDeleteId(null);
        setError('');
    };

    const closeModal = () => {
        setEditingUser(null);
        setIsAddModalOpen(false);
        setConfirmingDeleteId(null);
        setError('');
    };

    const filteredTrainers = trainers.filter(trainer => 
        trainer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading && trainers.length === 0) return <div className="loading">טוען מאמנים...</div>;

    return (
        <div className="trainers-view-container">
            <div className="view-header">
                <h3>צוות המאמנים ({trainers.length})</h3>
                <input 
                    type="text"
                    placeholder="חפש לפי שם או אימייל..."
                    className="search-input"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <button className="btn btn-primary" onClick={openAddModal}>
                    + הוסף מאמן
                </button>
            </div>
            
            {error && <p className={`error ${confirmingDeleteId ? 'confirm-message' : ''}`}>{error}</p>}
            
            <div className="trainers-grid">
                {filteredTrainers.map(trainer => (
                    <div key={trainer.id} className="trainer-card">
                        <h4>{trainer.full_name}</h4>
                        <p>{trainer.email}</p>
                        <p>{trainer.phone}</p>
                        <div className="card-actions">
                            <button className="btn btn-secondary" onClick={() => openEditModal(trainer)}>
                                ערוך
                            </button>
                            <button 
                                className={`btn ${confirmingDeleteId === trainer.id ? 'btn-danger-confirm' : 'btn-danger'}`} 
                                onClick={() => handleDelete(trainer.id, trainer.full_name)}
                                disabled={isLoading && confirmingDeleteId === trainer.id}
                            >
                                {confirmingDeleteId === trainer.id ? 'לחץ לאישור' : 'מחק'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {(isAddModalOpen || editingUser) && (
                <UserModal 
                    user={editingUser}
                    defaultRole="trainer"
                    onClose={closeModal}
                    onSave={handleSave}
                />
            )}

            <button className="fab" onClick={openAddModal}>+</button>
        </div>
    );
}

export default TrainersView;