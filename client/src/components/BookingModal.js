import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/UserModal.css'; 

function BookingModal({ event, onClose, onSave }) {
    const { user, activeRole } = useAuth();
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
    const [isConfirmingWaitlist, setIsConfirmingWaitlist] = useState(false);

    const isEventInPast = event.start < new Date();

    const resetConfirmations = () => {
        setError('');
        setIsConfirmingCancel(false);
        setIsConfirmingWaitlist(false);
    };

    const handleRegister = async () => {
        resetConfirmations();
        setIsSubmitting(true);
        try {
            const payload = { 
                meetingId: event.id, 
                forceWaitlist: isConfirmingWaitlist 
            };
            const result = await api.post('/api/participants', payload);
            onSave();
        } catch (err) {
            const serverResponse = err.response?.data;
            if (serverResponse && serverResponse.errorType === 'CLASS_FULL') {
                setError(serverResponse.message);
                setIsConfirmingWaitlist(true);
            } else {
                setError(err.message || 'שגיאה בעת ההרשמה.');
                setIsConfirmingWaitlist(false);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = async () => {
        if (!event.registrationId) {
            setError("שגיאה: לא נמצא מזהה הרשמה לביטול.");
            return;
        }

        if (!isConfirmingCancel) {
            resetConfirmations();
            setIsConfirmingCancel(true);
            setError('נא לאשר את ביטול ההרשמה בלחיצה נוספת.');
            return;
        }

        resetConfirmations();
        setIsSubmitting(true);
        try {
            await api.delete(`/api/participants/${event.registrationId}`);
            onSave();
        } catch (err) {
            setError(err.message || 'שגיאה בביטול ההרשמה.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleClose = () => {
        resetConfirmations();
        onClose();
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
                <button 
                    onClick={handleCancel} 
                    className={`btn ${isConfirmingCancel ? 'btn-danger-confirm' : 'cancel-btn'}`} 
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'מבטל...' : (isConfirmingCancel ? 'לחץ שוב לאישור ביטול' : 'בטל הרשמה')}
                </button>
            );
        }
        
        if (event.status === 'waiting' || event.status === 'pending') {
            return (
                <>
                    <p><strong>
                        {event.status === 'waiting' ? 'אתה נמצא ברשימת ההמתנה.' : 'המקום שלך ממתין לאישור.'}
                    </strong></p>
                    <button 
                        onClick={handleCancel} 
                        className={`btn ${isConfirmingCancel ? 'btn-danger-confirm' : 'cancel-btn'}`} 
                        disabled={isSubmitting}
                        style={{marginTop: '10px'}}
                    >
                        {isSubmitting ? 'מבטל...' : (isConfirmingCancel ? 'לחץ שוב לאישור' : 'בטל הרשמה מההמתנה')}
                    </button>
                </>
            );
        }
        
        const isFull = (event.participant_count >= event.capacity);
        
        if (isFull && !isConfirmingWaitlist) {
            const count = event.waiting_list_count || 0;
            const msg = count > 0 ? `השיעור מלא. כבר יש ${count} ברשימת ההמתנה.` : 'השיעור מלא.';
            return (
                <>
                    <p><strong>{msg}</strong></p>
                    <button onClick={handleRegister} className="btn btn-warning" disabled={isSubmitting}>
                        {isSubmitting ? 'מצטרף...' : 'הצטרף לרשימת ההמתנה'}
                    </button>
                </>
            );
        }

        if (isConfirmingWaitlist) {
             return (
                <button onClick={handleRegister} className="btn btn-warning" disabled={isSubmitting}>
                    {isSubmitting ? 'מצטרף...' : 'אשר הצטרפות להמתנה'}
                </button>
            );
        }

        return (
            <button onClick={handleRegister} className="btn register-btn" disabled={isSubmitting}>
                {isSubmitting ? 'רושם...' : 'הירשם לשיעור'}
            </button>
        );
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={handleClose}>&times;</button>
                <h2>פרטי השיעור</h2>
                <h3>{event.title.split(' (')[0]}</h3>
                <p><strong>מאמן/ה:</strong> {event.trainerName}</p>
                <p><strong>חדר:</strong> {event.roomName}</p>
                <p><strong>תאריך:</strong> {event.start.toLocaleDateString('he-IL')}</p>
                <p><strong>שעה:</strong> {event.start.toTimeString().slice(0, 5)}</p>
                
                {error && <p className={`error ${isConfirmingCancel || isConfirmingWaitlist ? 'confirm-message' : ''}`}>{error}</p>}

                <div className="modal-actions">
                    {renderActionButtons()}
                </div>
            </div>
        </div>
    );
}

export default BookingModal;