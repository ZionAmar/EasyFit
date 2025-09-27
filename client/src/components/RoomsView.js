import React, { useState, useEffect } from 'react';
import api from '../services/api';
import RoomModal from '../components/RoomModal';
import '../styles/TrainersView.css';

function RoomsView() {
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingRoom, setEditingRoom] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredRooms = rooms.filter(room => 
        room.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <div className="loading">טוען חדרים...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="trainers-view-container">
            <div className="view-header">
                <h3>רשימת חדרים</h3>
                
                <input 
                    type="text"
                    placeholder="חפש לפי שם חדר..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                    + הוסף חדר
                </button>
            </div>
            
            <div className="trainers-grid">
                {filteredRooms.map(room => (
                    <div key={room.id} className="trainer-card">
                        <h4>{room.name}</h4>
                        <p>קיבולת: {room.capacity} אנשים</p>
                        <p>{room.has_equipment ? 'כולל ציוד' : 'ללא ציוד'}</p>
                        <div className="card-actions">
                            <button className="btn btn-secondary" onClick={() => setEditingRoom(room)}>ערוך</button>
                            <button className="btn btn-danger" onClick={() => handleDelete(room.id, room.name)}>מחק</button>
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

            <button className="fab" onClick={() => setIsAddModalOpen(true)}>+</button>
        </div>
    );
}

export default RoomsView;