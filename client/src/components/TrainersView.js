import React, { useState, useEffect } from 'react';
import api from '../services/api';
import TrainerModal from '../components/TrainerModal';
import '../styles/TrainersView.css';

function TrainersView() {
    const [trainers, setTrainers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingTrainer, setEditingTrainer] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    const [searchTerm, setSearchTerm] = useState('');

    const fetchTrainers = async () => {
        setIsLoading(true);
        try {
            const data = await api.get('/api/users/all?role=trainer');
            setTrainers(data);
        } catch (err) {
            setError('שגיאה בטעינת המאמנים');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTrainers();
    }, []);
    
    const handleSave = () => {
        setEditingTrainer(null);
        setIsAddModalOpen(false);
        fetchTrainers();
    };

    const handleDelete = async (trainerId, trainerName) => {
        if (window.confirm(`האם אתה בטוח שברצונך למחוק את ${trainerName}?`)) {
            try {
                await api.delete(`/api/users/${trainerId}`);
                fetchTrainers();
            } catch (err) {
                setError(err.message || 'שגיאה במחיקת המאמן.');
            }
        }
    };

    const filteredTrainers = trainers.filter(trainer => 
        trainer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <div className="loading">טוען מאמנים...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="trainers-view-container">
            <div className="view-header">
                <h3>צוות המאמנים</h3>
                <input 
                    type="text"
                    placeholder="חפש לפי שם או אימייל..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                    + הוסף מאמן
                </button>
            </div>
            
            <div className="trainers-grid">
                {filteredTrainers.map(trainer => (
                    <div key={trainer.id} className="trainer-card">
                        <h4>{trainer.full_name}</h4>
                        <p>{trainer.email}</p>
                        <p>{trainer.phone}</p>
                        <div className="card-actions">
                            <button className="btn btn-secondary" onClick={() => setEditingTrainer(trainer)}>
                                ערוך
                            </button>
                            <button className="btn btn-danger" onClick={() => handleDelete(trainer.id, trainer.full_name)}>
                                מחק
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {(isAddModalOpen || editingTrainer) && (
                <TrainerModal 
                    trainer={editingTrainer}
                    onClose={() => { setEditingTrainer(null); setIsAddModalOpen(false); }}
                    onSave={handleSave}
                />
            )}

            <button className="fab" onClick={() => setIsAddModalOpen(true)}>+</button>
        </div>
    );
}

export default TrainersView;