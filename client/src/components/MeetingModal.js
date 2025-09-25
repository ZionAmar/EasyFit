import React, { useState, useEffect } from 'react';
import api from '../services/api';
import MultiSelect from './MultiSelect';

function MeetingModal({ meeting, onSave, onClose, initialData, operatingHours }) {
    const isEditMode = Boolean(meeting);
    const [formData, setFormData] = useState({
        name: '', date: '', start_time: '', end_time: '', 
        trainer_id: '', room_id: '', participantIds: []
    });
    const [allTrainers, setAllTrainers] = useState([]);
    const [allMembers, setAllMembers] = useState([]);
    const [allRooms, setAllRooms] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const loadPrerequisites = async () => {
            setIsLoading(true);
            try {
                const membersRes = await api.get('/api/users?role=member');
                setAllMembers(membersRes);

                if (isEditMode) {
                    const meetingDetails = await api.get(`/api/meetings/${meeting.id}`);
                    setFormData(meetingDetails);
                } else if (initialData) {
                    const startTime = new Date(`${initialData.date}T${initialData.start_time}`);
                    if (!isNaN(startTime)) {
                        startTime.setHours(startTime.getHours() + 1);
                        const endTime = startTime.toTimeString().slice(0, 5);
                        setFormData(prev => ({ ...prev, ...initialData, end_time: endTime }));
                    } else {
                        setFormData(prev => ({ ...prev, ...initialData }));
                    }
                }
            } catch (err) {
                setError("שגיאה בטעינת נתוני הטופס");
            } finally {
                setIsLoading(false);
            }
        };
        loadPrerequisites();
    }, [meeting, isEditMode, initialData]);

    useEffect(() => {
        const fetchAvailableRooms = async () => {
            const { date, start_time, end_time } = formData;
            if (date && start_time && end_time) {
                try {
                    let url = `/api/rooms/available?date=${date}&start_time=${start_time}&end_time=${end_time}`;
                    if (isEditMode && meeting?.id) {
                        url += `&meetingId=${meeting.id}`;
                    }
                    const availableRooms = await api.get(url);
                    setAllRooms(availableRooms);
                } catch (err) {
                    console.error("Failed to fetch available rooms", err);
                    setAllRooms([]);
                }
            }
        };
        fetchAvailableRooms();
    }, [formData.date, formData.start_time, formData.end_time, isEditMode, meeting]);

    useEffect(() => {
        const fetchAvailableTrainers = async () => {
            const { date, start_time, end_time } = formData;
            if (date && start_time && end_time) {
                try {
                    let url = `/api/users/available-trainers?date=${date}&start_time=${start_time}&end_time=${end_time}`;
                    if (isEditMode && meeting?.id) {
                        url += `&meetingId=${meeting.id}`;
                    }
                    const availableTrainers = await api.get(url);
                    setAllTrainers(availableTrainers);
                } catch (err) {
                    console.error("Failed to fetch available trainers", err);
                    setAllTrainers([]);
                }
            }
        };
        fetchAvailableTrainers();
    }, [formData.date, formData.start_time, formData.end_time, isEditMode, meeting]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newFormData = { ...formData, [name]: value };

        if (name === 'start_time' && newFormData.date) {
            const startTime = new Date(`${newFormData.date}T${value}`);
            if (!isNaN(startTime)) {
                startTime.setHours(startTime.getHours() + 1);
                newFormData.end_time = startTime.toTimeString().slice(0, 5);
            }
        }
        
        setFormData(newFormData);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');
        
        const now = new Date();
        const meetingStartDateTime = new Date(`${formData.date}T${formData.start_time}`);
        now.setSeconds(0, 0); 

        if (meetingStartDateTime < now) {
            setError('לא ניתן לקבוע שיעור בזמן עבר.');
            return;
        }

        const meetingDayJs = new Date(formData.date).getDay(); 
        const meetingDayDB = (meetingDayJs + 1) % 7; 
        const hoursForDay = operatingHours.find(h => h.day_of_week === meetingDayDB);

        if (!hoursForDay || (hoursForDay.open_time === hoursForDay.close_time)) {
            setError(`הסטודיו סגור ביום שנבחר.`);
            return;
        }

        if (formData.start_time < hoursForDay.open_time || formData.end_time > hoursForDay.close_time) {
            setError(`שעות הפעילות ביום זה הן בין ${hoursForDay.open_time.slice(0,5)} ל-${hoursForDay.close_time.slice(0,5)}.`);
            return;
        }
        
        setIsLoading(true);
        try {
            if (isEditMode) {
                await api.put(`/api/meetings/${meeting.id}`, formData);
            } else {
                await api.post('/api/meetings', formData);
            }
            onSave();
        } catch (err) {
            setError(err.message || 'Error saving the meeting.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDelete = async () => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק את השיעור?')) {
            setIsLoading(true); setError('');
            try {
                await api.delete(`/api/meetings/${meeting.id}`);
                onSave();
            } catch (err) {
                setError(err.message || 'שגיאה במחיקת השיעור');
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                <h2>{isEditMode ? 'עריכת שיעור' : 'שיעור חדש'}</h2>
                <form onSubmit={handleSave} className="settings-form">
                    <div className="form-field"><label>שם שיעור</label><input name="name" value={formData.name || ''} onChange={handleChange} required /></div>
                    <div className="form-field"><label>תאריך</label><input type="date" name="date" value={formData.date || ''} onChange={handleChange} min={today} required /></div>
                    <div className="form-field"><label>שעת התחלה</label><input type="time" name="start_time" value={formData.start_time || ''} onChange={handleChange} required /></div>
                    <div className="form-field"><label>שעת סיום</label><input type="time" name="end_time" value={formData.end_time || ''} onChange={handleChange} required /></div>
                    <div className="form-field"><label>מאמן</label><select name="trainer_id" value={formData.trainer_id || ''} onChange={handleChange} required><option value="">בחר מאמן</option>{allTrainers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}</select></div>
                    
                    <div className="form-field">
                        <label>חדר</label>
                        <select name="room_id" value={formData.room_id || ''} onChange={handleChange} required>
                            <option value="">בחר חדר</option>
                            {allRooms.map(r => (
                                <option key={r.id} value={r.id}>
                                    {`${r.name} (קיבולת: ${r.capacity}) ${r.has_equipment ? '🏋️‍♂️' : ''}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-field">
                        <label>משתתפים</label>
                        <MultiSelect 
                            options={allMembers.map(m => ({ value: m.id, label: m.full_name }))}
                            selected={formData.participantIds || []}
                            onChange={(selectedIds) => setFormData(prev => ({ ...prev, participantIds: selectedIds }))}
                            placeholder="בחר משתתפים..."
                        />
                    </div>
                    
                    {error && <p className="error">{error}</p>}

                    <div className="modal-actions">
                        {isEditMode && <button type="button" className="delete-btn" onClick={handleDelete} disabled={isLoading}>מחק</button>}
                        <button type="submit" className="cta-button-pro" disabled={isLoading}>{isLoading ? 'שומר...' : 'שמור שינויים'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default MeetingModal;