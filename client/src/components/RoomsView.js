import React, { useState, useEffect } from 'react';
import api from '../services/api';
import RoomModal from './RoomModal';
import '../styles/TrainersView.css'; 

function RoomsView() {
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingRoom, setEditingRoom] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const fetchRooms = async () => {
        setIsLoading(true);
        try {
            const data = await api.get('/api/rooms');
            setRooms(data);
        } catch (err) {
            setError('שגיאה בטעינת החדרים');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);
    
    const handleSave = () => {
        setEditingRoom(null);
        setIsAddModalOpen(false);
        fetchRooms(); 
    };

    const handleDelete = async (roomId, roomName) => {
        if (window.confirm(`האם למחוק את חדר "${roomName}"? לא ניתן למחוק חדר אם יש לו שיעורים עתידיים.`)) {
            try {
                await api.delete(`/api/rooms/${roomId}`);
                fetchRooms();
            } catch (err) {
                setError(err.message || 'שגיאה במחיקת החדר.');
            }
        }
    };

    if (isLoading) return <div className="loading">טוען חדרים...</div>;
    if (error) return <div className="error-state">{error}</div>;

    return (
        <div className="trainers-view-container">
            <div className="view-header">
                <h3>רשימת חדרים</h3>
                <button className="cta-button-pro" onClick={() => setIsAddModalOpen(true)}>
                    + הוסף חדר
                </button>
            </div>
            
            <div className="trainers-grid">
                {rooms.map(room => (
                    <div key={room.id} className="trainer-card">
                        <h4>{room.name}</h4>
                        <p>קיבולת: {room.capacity} אנשים</p>
                        <p>{room.is_available ? 'זמין' : 'לא זמין'}</p>
                        <div className="card-actions">
                            <button className="edit-btn" onClick={() => setEditingRoom(room)}>ערוך</button>
                            <button className="delete-btn" onClick={() => handleDelete(room.id, room.name)}>מחק</button>
                        </div>
                    </div>
                ))}
            </div>

            {(isAddModalOpen || editingRoom) && (
                <RoomModal 
                    room={editingRoom}
                    onClose={() => { setEditingRoom(null); setIsAddModalOpen(false); }}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}

export default RoomsView;