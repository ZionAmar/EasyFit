import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/StudioSettingsView.css'; 

// --- ⬇️ התיקון נמצא כאן: תיקנו את המספור והסדר ⬇️ ---
const DAYS_OF_WEEK = [
    { id: 0, name: 'ראשון' },
    { id: 1, name: 'שני' },
    { id: 2, name: 'שלישי' },
    { id: 3, name: 'רביעי' },
    { id: 4, name: 'חמישי' },
    { id: 5, name: 'שישי' },
    { id: 6, name: 'שבת' }
];

function StudioSettingsView({ initialDetails }) {
    const [details, setDetails] = useState(initialDetails || {});
    const [hours, setHours] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settingsData = await api.get('/api/studio/settings');
                setDetails(settingsData.details);

                const fullHours = DAYS_OF_WEEK.map(day => {
                    const existing = settingsData.hours.find(h => h.day_of_week === day.id);
                    // אם לא נמצאו שעות שמורות ליום מסוים, נייצר רשומה ריקה עבורו
                    return existing || { day_of_week: day.id, open_time: '00:00:00', close_time: '00:00:00' };
                });
                setHours(fullHours);

            } catch (err) {
                setError('שגיאה בטעינת הגדרות הסטודיו.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleDetailChange = (e) => {
        setDetails({ ...details, [e.target.name]: e.target.value });
    };

    const handleHourChange = (dayId, field, value) => {
        const updatedHours = hours.map(h => 
            h.day_of_week === dayId ? { ...h, [field]: value } : h
        );
        setHours(updatedHours);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);
        try {
            await api.put('/api/studio/settings', { details, hours });
            setSuccess('ההגדרות נשמרו בהצלחה!');
        } catch (err) {
            setError(err.message || 'שגיאה בשמירת ההגדרות.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !details.name) {
        return <div className="loading">טוען הגדרות...</div>;
    }

    // פונקציית עזר להמרת פורמט הזמן אם הוא מגיע עם שניות
    const formatTimeForInput = (timeString) => {
        if (typeof timeString === 'string' && timeString.length === 8) { // בודק אם הפורמט הוא HH:mm:ss
            return timeString.substring(0, 5); // מחזיר רק HH:mm
        }
        return timeString || '00:00';
    };

    return (
        <form onSubmit={handleSave} className="card-pro settings-form">
            <div className="form-header">
                <h2>הגדרות סטודיו</h2>
            </div>
            
            <div className="settings-grid-container">
                <div className="form-section">
                    <h4>פרטים כלליים</h4>
                    <div className="form-field">
                        <label>שם הסטודיו</label>
                        <input name="name" value={details.name || ''} onChange={handleDetailChange} />
                    </div>
                    <div className="form-field">
                        <label>מספר טלפון</label>
                        <input name="phone_number" value={details.phone_number || ''} onChange={handleDetailChange} />
                    </div>
                    <div className="form-field">
                        <label>כתובת</label>
                        <input name="address" value={details.address || ''} onChange={handleDetailChange} />
                    </div>
                    <div className="form-field">
                        <label>סלוגן (Tagline)</label>
                        <input name="tagline" value={details.tagline || ''} onChange={handleDetailChange} />
                    </div>
                </div>

                <div className="form-section">
                    <h4>שעות פעילות</h4>
                    {DAYS_OF_WEEK.map(day => {
                        const hourData = hours.find(h => h.day_of_week === day.id) || {};
                        return (
                            <div key={day.id} className="day-hours-row">
                                <label className="day-name">{day.name}</label>
                                
                                <div className="time-inputs-container">
                                    <div className="time-input-pair">
                                        <label className="mobile-only-label">פתיחה</label>
                                        <input type="time" value={formatTimeForInput(hourData.open_time)} onChange={e => handleHourChange(day.id, 'open_time', e.target.value)} />
                                    </div>
                                    
                                    <span className="desktop-only-dash">-</span>

                                    <div className="time-input-pair">
                                        <label className="mobile-only-label">סגירה</label>
                                        <input type="time" value={formatTimeForInput(hourData.close_time)} onChange={e => handleHourChange(day.id, 'close_time', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <button type="submit" className="cta-button-pro" disabled={isLoading}>
                {isLoading ? 'שומר...' : 'שמור שינויים'}
            </button>
            <div className="form-footer">
                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}
            </div>
        </form>
    );
}

export default StudioSettingsView;