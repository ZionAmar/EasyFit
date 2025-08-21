const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meeting_C');
const { isLoggedIn, requireRole } = require('../middlewares/auth_Midd');

// נתיב ציבורי לקבלת לו"ז, דורש studioId ב-query params
// דוגמה: /api/meetings/public?studioId=1
router.get('/public', meetingController.getPublicSchedule);

// נתיב מאובטח לקבלת לוחות זמנים למשתמש מחובר (מתאמן, מאמן או מנהל)
// הלוגיקה בקונטרולר ובסרוויס תנתב את הבקשה לפי תפקיד המשתמש
router.get('/', isLoggedIn, meetingController.getMeetings);

// נתיב ליצירת שיעור, דורש הרשאת מנהל
router.post('/', isLoggedIn, requireRole('admin'), meetingController.createMeeting);

// נתיב לעדכון הגעת מאמן, דורש הרשאת מאמן או מנהל
router.patch('/:id/arrive', isLoggedIn, requireRole('trainer', 'admin'), meetingController.markTrainerArrival);

module.exports = router;