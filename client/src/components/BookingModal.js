import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function BookingModal({ event, onClose }) {
    const { user, activeRole } = useAuth();
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ###  השינוי מתחיל כאן ###
    // 1. נוסיף משתנה שבודק אם האירוע כבר התרחש
    const isEventInPast = event.start < new Date();

    const handleRegister = async () => {
        setError('');
        setIsSubmitting(true);
        try {
            // ב-fetch זה, מומלץ להשתמש ב-api service כמו שעשינו בקומפוננטות אחרות
            // כדי להבטיח שהבקשה תהיה מאומתת
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
            onClose(); // סגור את המודאל ורענן את היומן אם צריך
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

                {/* 2. נעדכן את הלוגיקה שתבדוק קודם כל אם השיעור עבר */}
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