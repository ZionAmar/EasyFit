// קובץ: src/components/TrainersView.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import TrainerModal from './TrainerModal';
import '../styles/TrainersView.css'; // ניצור קובץ עיצוב פשוט

function TrainersView() {
    const [trainers, setTrainers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingTrainer, setEditingTrainer] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const fetchTrainers = async () => {
        setIsLoading(true);
        try {
            const data = await api.get('/api/users?role=trainer');
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
        // סגור את כל המודאלים וטען מחדש את הרשימה
        setEditingTrainer(null);
        setIsAddModalOpen(false);
        fetchTrainers();
    };

    if (isLoading) return <div className="loading">טוען מאמנים...</div>;
    if (error) return <div className="error-state">{error}</div>;

    return (
        <div className="trainers-view-container">
            <div className="view-header">
                <h3>צוות המאמנים</h3>
                <button className="cta-button-pro" onClick={() => setIsAddModalOpen(true)}>
                    + הוסף מאמן
                </button>
            </div>
            
            <div className="trainers-grid">
                {trainers.map(trainer => (
                    <div key={trainer.id} className="trainer-card">
                        <h4>{trainer.full_name}</h4>
                        <p>{trainer.email}</p>
                        <p>{trainer.phone}</p>
                        <button className="edit-btn" onClick={() => setEditingTrainer(trainer)}>
                            ערוך
                        </button>
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
        </div>
    );
}

export default TrainersView;