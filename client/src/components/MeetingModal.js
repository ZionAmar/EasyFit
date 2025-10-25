import React, { useState, useEffect } from 'react';
import api from '../services/api';
import MultiSelect from './MultiSelect';
import '../styles/UserModal.css';

function MeetingModal({ meeting, onSave, onClose, initialData, operatingHours }) {
    const isEditMode = Boolean(meeting);
    const [formData, setFormData] = useState({
        name: '', date: '', start_time: '', end_time: '',
        trainer_id: '', room_id: '', participantIds: []
    });
    
    // States to hold the options for the dropdowns
    const [allMembers, setAllMembers] = useState([]);
    const [availableTrainers, setAvailableTrainers] = useState([]);
    const [availableRooms, setAvailableRooms] = useState([]);

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const today = new Date().toISOString().split('T')[0];

    // Single, powerful useEffect to handle all data loading
    useEffect(() => {
        const loadModalData = async () => {
            setIsLoading(true);
            setError('');
            try {
                // Step 1: Establish the base data (especially date and time)
                let baseData = {};
                if (isEditMode && meeting?.id) {
                    const meetingDetails = await api.get(`/api/meetings/${meeting.id}`);
                    const participantIds = meetingDetails.participants ? meetingDetails.participants.map(p => p.id) : [];
                    // Format date correctly for input[type=date]
                    if (meetingDetails.date) {
                        meetingDetails.date = meetingDetails.date.split('T')[0];
                    }
                    baseData = { ...meetingDetails, participantIds };
                } else if (initialData) {
                    const startTime = new Date(`${initialData.date}T${initialData.start_time}`);
                    if (!isNaN(startTime)) {
                        startTime.setHours(startTime.getHours() + 1);
                        const endTime = startTime.toTimeString().slice(0, 5);
                        baseData = { ...initialData, end_time: endTime };
                    } else {
                        baseData = initialData;
                    }
                }
                setFormData(prev => ({ ...prev, ...baseData }));

                // Step 2: Now that we have a date and time, fetch available resources
                const { date, start_time, end_time } = baseData;
                if (date && start_time && end_time) {
                    let roomsUrl = `/api/rooms/available?date=${date}&start_time=${start_time}&end_time=${end_time}`;
                    let trainersUrl = `/api/users/available-trainers?date=${date}&start_time=${start_time}&end_time=${end_time}`;
                    if (isEditMode && meeting?.id) {
                        roomsUrl += `&meetingId=${meeting.id}`;
                        trainersUrl += `&meetingId=${meeting.id}`;
                    }
                    
                    // Step 3: Fetch all remaining prerequisites in parallel
                    const [membersRes, roomsRes, trainersRes] = await Promise.all([
                        api.get('/api/users/all?role=member'),
                        api.get(roomsUrl),
                        api.get(trainersUrl)
                    ]);

                    setAllMembers(membersRes || []);
                    setAvailableRooms(roomsRes || []);
                    setAvailableTrainers(trainersRes || []);
                } else {
                    // Fallback if no date/time is set yet, just load members
                    const membersRes = await api.get('/api/users/all?role=member');
                    setAllMembers(membersRes || []);
                }

            } catch (err) {
                setError("שגיאה בטעינת נתוני הטופס. אנא סגור ונסה שוב.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        loadModalData();
    }, [meeting, isEditMode, initialData]); // This effect runs only once when the modal opens

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

        if (!isEditMode && meetingStartDateTime < now) {
            return setError('לא ניתן לקבוע שיעור בזמן עבר.');
        }

        const meetingDayJs = new Date(formData.date).getDay();
        const meetingDayDB = meetingDayJs; // Assuming JS getDay (0=Sun, 6=Sat) matches your logic. Adjust if needed.
        const hoursForDay = operatingHours.find(h => h.day_of_week === meetingDayDB);

        if (!hoursForDay || (hoursForDay.open_time === hoursForDay.close_time)) {
            return setError(`הסטודיו סגור ביום שנבחר.`);
        }

        if (formData.start_time < hoursForDay.open_time || formData.end_time > hoursForDay.close_time) {
            return setError(`שעות הפעילות ביום זה הן בין ${hoursForDay.open_time.slice(0, 5)} ל-${hoursForDay.close_time.slice(0, 5)}.`);
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
            setError(err.message || 'שגיאה בשמירת המפגש.');
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
    
    if (isLoading) {
        return (
             <div className="modal-overlay">
                <div className="modal-content"><div className="loading">טוען...</div></div>
            </div>
        );
    }

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
                    
                    <div className="form-field">
                        <label>מאמן</label>
                        <select name="trainer_id" value={formData.trainer_id || ''} onChange={handleChange} required>
                            <option value="">בחר מאמן</option>
                            {/* Improvement: If current trainer is not in available list, still show them */}
                            {isEditMode && formData.trainer && !availableTrainers.some(t => t.id === formData.trainer_id) &&
                                <option key={formData.trainer_id} value={formData.trainer_id}>{formData.trainer.full_name} (לא זמין)</option>
                            }
                            {availableTrainers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                        </select>
                    </div>

                    <div className="form-field">
                        <label>חדר</label>
                        <select name="room_id" value={formData.room_id || ''} onChange={handleChange} required>
                            <option value="">בחר חדר</option>
                             {/* Improvement: If current room is not in available list, still show it */}
                            {isEditMode && formData.room && !availableRooms.some(r => r.id === formData.room_id) &&
                                <option key={formData.room_id} value={formData.room_id}>{formData.room.name} (לא זמין)</option>
                            }
                            {availableRooms.map(r => (
                                <option key={r.id} value={r.id}>
                                    {`${r.name} (קיבולת: ${r.capacity}) ${r.has_equipment ? '🏋️‍♂️' : ''}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-field">
                        <label>משתתפים ({formData.participantIds?.length || 0})</label>
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