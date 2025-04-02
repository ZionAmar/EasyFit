const express = require('express');
const router = express.Router();
const { joinMeeting, cancelParticipation } = require('../middleware/participationMid');

// הצטרפות למפגש
router.post('/join', joinMeeting, (req, res) => {
    if (req.error) {
        return res.status(req.error.status).render('error', {
            title: 'שגיאה',
            message: req.error.message
        });
    }

    const message = req.joinStatus === 'active'
        ? 'הצטרפת בהצלחה למפגש.'
        : 'המפגש מלא. הוספת לרשימת המתנה.';

    res.render('registrationResult', {
        title: 'הצטרפות למפגש',
        header: 'תוצאה',
        message
    });
});

// ביטול הצטרפות
router.post('/cancel', cancelParticipation, (req, res) => {
    if (req.error) {
        return res.status(req.error.status).render('error', {
            title: 'שגיאה',
            message: req.error.message
        });
    }

    res.render('registrationResult', {
        title: 'ביטול השתתפות',
        header: 'ההרשמה בוטלה',
        message: 'ביטלת את ההשתתפות בהצלחה.'
    });
});

module.exports = router;
