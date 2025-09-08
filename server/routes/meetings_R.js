// קובץ: server/routes/meeting_R.js (מעודכן)
const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meeting_C');
const { isLoggedIn, requireRole } = require('../middlewares/auth_Midd');

// --- נתיבים קיימים ---
router.get('/public', meetingController.getPublicSchedule);
router.get('/', isLoggedIn, meetingController.getMeetings);
router.post('/', isLoggedIn, requireRole('admin'), meetingController.createMeeting);
router.patch('/:id/arrive', isLoggedIn, requireRole('trainer', 'admin'), meetingController.markTrainerArrival);

// --- נתיבים חדשים לניהול מלא ---
// קבלת שיעור בודד עם כל הפרטים (כולל משתתפים)
router.get('/:id', isLoggedIn, requireRole('admin'), meetingController.getMeetingById);
// עדכון שיעור קיים
router.put('/:id', isLoggedIn, requireRole('admin'), meetingController.updateMeeting);
// מחיקת שיעור
router.delete('/:id', isLoggedIn, requireRole('admin'), meetingController.deleteMeeting);

module.exports = router;