import React from 'react';
import { useSearchParams } from 'react-router-dom';

function BookingErrorPage() {
    const [searchParams] = useSearchParams();
    const message = searchParams.get('message');

    return (
        <div className="page-center">
            <div style={{fontSize: '3rem'}}>⚠️</div>
            <h1>אופס, משהו השתבש</h1>
            <p>{message || 'אירעה שגיאה לא צפויה.'}</p>
        </div>
    );
}

export default BookingErrorPage;