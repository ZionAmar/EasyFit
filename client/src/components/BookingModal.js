import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function BookingModal({ event, onClose }) {
    const { user, activeRole } = useAuth();
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRegister = async () => {
        setError('');
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/participants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ meetingId: event.id })
            });
            
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'שגיאה בהרשמה');
            }
            
            alert(`נרשמת בהצלחה לשיעור: ${event.title}`);
            onClose();
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
                <h3>{event.title.split('(')[0]}</h3>
                <p><strong>מאמן/ה:</strong> {event.trainerName}</p>
                <p><strong>חדר:</strong> {event.roomName}</p>
                <p><strong>תאריך:</strong> {event.start.toLocaleDateString('he-IL')}</p>
                <p><strong>שעה:</strong> {event.start.toTimeString().slice(0, 5)}</p>
                
                {error && <p className="error">{error}</p>}

                {user && activeRole === 'member' && !event.isMyEvent ? (
                    <button className="cta-button" onClick={handleRegister} disabled={isSubmitting}>
                        {isSubmitting ? 'רושם...' : 'כן, הרשם אותי!'}
                    </button>
                ) : (
                    <p><strong>{event.isMyEvent ? 'אתה כבר רשום לשיעור זה.' : 'יש להתחבר כמתאמן כדי להירשם.'}</strong></p>
                )}
            </div>
        </div>
    );
}

export default BookingModal;