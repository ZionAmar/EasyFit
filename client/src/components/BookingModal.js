import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

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
                alert(`נרשמת בהצלחה לשיעור: ${event.title}`);
            }
            onSave();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>×</button>
                <h2>פרטי השיעור</h2>
                <h3>{event.title.split(' (')[0]}</h3>
                <p><strong>מאמן/ה:</strong> {event.trainerName}</p>
                <p><strong>חדר:</strong> {event.roomName}</p>
                <p><strong>תאריך:</strong> {event.start.toLocaleDateString('he-IL')}</p>
                <p><strong>שעה:</strong> {event.start.toTimeString().slice(0, 5)}</p>
                
                {error && <p className="error">{error}</p>}

                {isEventInPast ? (
                    <p><strong>שיעור כבר התקיים.</strong></p>
                ) : user && activeRole === 'member' && !event.isMyEvent ? (
                    <button className="cta-button" onClick={handleRegister} disabled={isSubmitting}>
                        {isSubmitting ? 'רושם...' : 'הירשם'}
                    </button>
                ) : (
                    <p><strong>{event.isMyEvent ? 'אתה כבר רשום לשיעור זה.' : 'יש להתחבר כמתאמן כדי להירשם.'}</strong></p>
                )}
            </div>
        </div>
    );
}

export default BookingModal;