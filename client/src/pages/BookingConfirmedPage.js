import React from 'react';
import { useLocation } from 'react-router-dom';

function BookingConfirmedPage({ status: initialStatus }) {
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const errorMessage = query.get('message');

    let status = initialStatus;
    let title = '';
    let text = '';
    let icon = '';

    if (errorMessage) {
        status = 'error';
    }

    const messages = {
        confirmed: {
            icon: '✅',
            title: 'ההרשמה אושרה!',
            text: 'שמחנו לעדכן שהבטחת את מקומך בשיעור. נתראה!'
        },
        declined: {
            icon: '👍',
            title: 'הבנו, תודה על העדכון.',
            text: 'ויתרת על המקום. אם יתפנה מקום נוסף, נודיע לך.'
        },
        error: {
            icon: '❌',
            title: 'אירעה שגיאה בהרשמה.',
            text: errorMessage || 'שגיאה לא ידועה, נסה שוב או פנה לתמיכה.'
        }
    };
    
    const content = messages[status] || messages['error'];

    return (
        <div className="page-center">
            <div style={{fontSize: '3rem'}}>{content.icon}</div>
            <h1>{content.title}</h1>
            <p>{content.text}</p>
        </div>
    );
}

export default BookingConfirmedPage;