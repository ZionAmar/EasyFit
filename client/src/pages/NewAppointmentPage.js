import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const STUDIO_OPEN_TIME = '06:00';
const STUDIO_CLOSE_TIME = '22:00';

function NewAppointmentPage() {
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [roomId, setRoomId] = useState('');
    const [rooms, setRooms] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/rooms')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setRooms(data);
                }
            })
            .catch(() => setError('לא ניתן לטעון את רשימת החדרים'));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await fetch('/api/meetings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    date,
                    start_time: startTime,
                    end_time: endTime,
                    room_id: roomId
                })
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'שגיאה ביצירת השיעור');
            }
            alert('השיעור נוצר בהצלחה!');
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="form-container">
            <h2>יצירת שיעור חדש</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="שם השיעור" value={name} onChange={e => setName(e.target.value)} required />
                <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                
                <input 
                    type="time" 
                    placeholder="שעת התחלה" 
                    value={startTime} 
                    onChange={e => setStartTime(e.target.value)} 
                    min={STUDIO_OPEN_TIME}
                    max={STUDIO_CLOSE_TIME}
                    required 
                />
                <input 
                    type="time" 
                    placeholder="שעת סיום" 
                    value={endTime} 
                    onChange={e => setEndTime(e.target.value)} 
                    min={STUDIO_OPEN_TIME}
                    max={STUDIO_CLOSE_TIME}
                    required 
                />

                <select value={roomId} onChange={e => setRoomId(e.target.value)} required>
                    <option value="">בחר חדר</option>
                    {rooms.map(room => (
                        <option key={room.id} value={room.id}>{room.name}</option>
                    ))}
                </select>
                
                {error && <p className="error">{error}</p>}
                <button type="submit">צור שיעור</button>
            </form>
        </div>
    );
}

export default NewAppointmentPage;