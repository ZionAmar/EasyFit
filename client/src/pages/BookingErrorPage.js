import React from 'react';
import { useSearchParams } from 'react-router-dom';

function BookingErrorPage() {
    const [searchParams] = useSearchParams();
    const message = searchParams.get('message');

    return (
        <div className="page-center">
            <div style={{fontSize: '3rem', color: '#dc3545'}}>❌</div>
            <h1>שגיאה בהרשמה</h1>
            <p>
                {message || 'אירעה שגיאה בלתי צפויה. אנא נסה שוב או פנה לסטודיו.'}
            </p>
        </div>
    );
}

export default BookingErrorPage;