const express = require('express');
const router = express.Router();
const { getMonthlyMeetings } = require('../middleware/calendarMid');
const { isLogged } = require('../middleware/loginMid'); // ✅ הוספת המידלוור

// אם לא נשלח שנה/חודש, נעשה הפניה אוטומטית לחודש הנוכחי
router.get('/', isLogged, (req, res, next) => {
    if (!req.query.year || !req.query.month) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        return res.redirect(`/calendar?year=${year}&month=${month}`);
    }
    next();
}, getMonthlyMeetings, (req, res) => {
    if (req.error) {
        return res.status(req.error.status).render('error', {
            title: 'שגיאה',
            message: req.error.message
        });
    }

    const { year, month, daysInMonth, startDay } = req.calendar;

    res.render('calendar', {
        title: 'יומן חודשי',
        header: `יומן מפגשים לחודש ${month}/${year}`,
        year,
        month,
        daysInMonth,
        startDay,
        meetingsByDay: req.meetingsByDay
    });
});

module.exports = router;
