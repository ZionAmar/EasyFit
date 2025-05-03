const express = require('express');
const router = express.Router();
const { getMonthlyMeetings, redirectToCurrentMonth } = require('../middleware/calendarMid');
const { isLogged } = require('../middleware/loginMid'); // ✅ הוספת המידלוור

// אם לא נשלח שנה/חודש, נעשה הפניה אוטומטית לחודש הנוכחי
router.get('/', isLogged, redirectToCurrentMonth, getMonthlyMeetings, (req, res) => {
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
