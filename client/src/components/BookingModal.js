import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/UserModal.css'; 

function BookingModal({ event, onClose, onSave }) {
    const { user, activeRole } = useAuth();
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEventInPast = event.start < new Date();

    const handleRegister = async () => {
        setError('');
        setIsSubmitting(true);
        try {
            const result = await api.post('/api/participants', { meetingId: event.id });
            
            if (result.status === 'waiting') {
                alert('השיעור מלא! הוספנו אותך לרשימת ההמתנה.');
            } else {
                alert(`נרשמת בהצלחה לשיעור: ${event.title.split(' (')[0]}`);
            }
            onSave();
        } catch (err) {
            setError(err.message || 'שגיאה בעת ההרשמה.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = async () => {
        if (!event.registrationId) {
            setError("שגיאה: לא נמצא מזהה הרשמה לביטול.");
            return;
        }

        if (window.confirm('האם לבטל את הרשמתך לשיעור?')) {
            setError('');
            setIsSubmitting(true);
            try {
                await api.delete(`/api/participants/${event.registrationId}`);
                alert('הרשמתך בוטלה בהצלחה.');
                onSave();
            } catch (err) {
                setError(err.message || 'שגיאה בביטול ההרשמה.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const renderActionButtons = () => {
        if (isEventInPast) {
            return <p><strong>שיעור זה כבר התקיים.</strong></p>;
        }

        if (!user || activeRole !== 'member') {
            return <p><strong>יש להתחבר כמתאמן כדי להירשם.</strong></p>;
        }

        if (event.isMyEvent) {
            return (
                <button onClick={handleCancel} className="btn cancel-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'מבטל...' : 'בטל הרשמה'}
                </button>
            );
        }
        
        if (event.status === 'waiting') {
            return <p><strong>אתה נמצא ברשימת ההמתנה.</strong></p>
        }

        return (
            <button onClick={handleRegister} className="btn register-btn" disabled={isSubmitting}>
                {isSubmitting ? 'רושם...' : 'הירשם לשיעור'}
            </button>
        );
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                <h2>פרטי השיעור</h2>
                <h3>{event.title.split(' (')[0]}</h3>
                <p><strong>מאמן/ה:</strong> {event.trainerName}</p>
                <p><strong>חדר:</strong> {event.roomName}</p>
                <p><strong>תאריך:</strong> {event.start.toLocaleDateString('he-IL')}</p> {/* <-- התיקון כאן */}
                <p><strong>שעה:</strong> {event.start.toTimeString().slice(0, 5)}</p>
                
                {error && <p className="error">{error}</p>}

                <div className="modal-actions">
                    {renderActionButtons()}
                </div>
            </div>
        </div>
    );
}

export default BookingModal;