import React from 'react';

function BookingConfirmedPage({ status }) {
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
        }
    };
    const content = messages[status];

    return (
        <div className="page-center">
            <div style={{fontSize: '3rem'}}>{content.icon}</div>
            <h1>{content.title}</h1>
            <p>{content.text}</p>
        </div>
    );
}

export default BookingConfirmedPage;