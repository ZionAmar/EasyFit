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
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);

    const fetchRooms = async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await api.get('/api/rooms');
            setRooms(data);
        } catch (err) {
            setError(err.message || 'שגיאה בטעינת החדרים');
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
        if (confirmingDeleteId !== roomId) {
            setConfirmingDeleteId(roomId);
            setError(`האם למחוק את "${roomName}"? לחץ שוב לאישור.`);
            return;
        }

        setError('');
        setIsLoading(true);
        try {
            await api.delete(`/api/rooms/${roomId}`);
            fetchRooms();
            setConfirmingDeleteId(null);
        } catch (err) {
            setError(err.message || 'שגיאה במחיקת החדר.');
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
        setEditingRoom(null);
        setIsAddModalOpen(true);
        setConfirmingDeleteId(null);
        setError('');
    };

    const openEditModal = (room) => {
        setIsAddModalOpen(false);
        setEditingRoom(room);
        setConfirmingDeleteId(null);
        setError('');
    };

    const closeModal = () => {
        setEditingRoom(null);
        setIsAddModalOpen(false);
        setConfirmingDeleteId(null);
        setError('');
    };

    const filteredRooms = rooms.filter(room => 
        room.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading && rooms.length === 0) return <div className="loading">טוען חדרים...</div>;

    return (
        <div className="trainers-view-container">
            <div className="view-header">
                <h3>רשימת חדרים ({rooms.length})</h3>
                
                <input 
                    type="text"
                    placeholder="חפש לפי שם חדר..."
                    className="search-input"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />

                <button className="btn btn-primary" onClick={openAddModal}>
                    + הוסף חדר
                </button>
            </div>
            
            {error && <p className={`error ${confirmingDeleteId ? 'confirm-message' : ''}`}>{error}</p>}

            <div className="trainers-grid">
                {filteredRooms.map(room => (
                    <div key={room.id} className="trainer-card">
                        <h4>{room.name}</h4>
                        <p>קיבולת: {room.capacity} אנשים</p>
                        <p>{room.has_equipment ? 'כולל ציוד' : 'ללא ציוד'}</p>
                        <div className="card-actions">
                            <button className="btn btn-secondary" onClick={() => openEditModal(room)}>ערוך</button>
                            <button 
                                className={`btn ${confirmingDeleteId === room.id ? 'btn-danger-confirm' : 'btn-danger'}`} 
                                onClick={() => handleDelete(room.id, room.name)}
                                disabled={isLoading && confirmingDeleteId === room.id}
                            >
                                {confirmingDeleteId === room.id ? 'לחץ לאישור' : 'מחק'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {(isAddModalOpen || editingRoom) && (
                <RoomModal 
                    room={editingRoom}
                    onClose={closeModal}
                    onSave={handleSave}
                />
            )}

            <button className="fab" onClick={openAddModal}>+</button>
        </div>
    );
}

export default RoomsView;