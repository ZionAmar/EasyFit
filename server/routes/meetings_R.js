const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meeting_C');
const { isLoggedIn, requireRole } = require('../middlewares/auth_Midd');

// נתיב ציבורי
router.get('/public', meetingController.getPublicSchedule);

// נתיב אישי ומאובטח
router.get('/', isLoggedIn, meetingController.getMeetings);

// נתיב ליצירת שיעור, מאובטח למנהלים בלבד (כפי שקבענו)
router.post('/', isLoggedIn, requireRole('admin'), meetingController.createMeeting);

module.exports = router;