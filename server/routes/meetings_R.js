const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meeting_C');
const { isLoggedIn, requireRole } = require('../middlewares/auth_Midd');

router.get('/public', meetingController.getPublicSchedule);
router.get('/', isLoggedIn, meetingController.getMeetings);
router.post('/', isLoggedIn, requireRole('admin'), meetingController.createMeeting);
router.patch('/:id/arrive', isLoggedIn, requireRole('trainer', 'admin'), meetingController.markTrainerArrival);

module.exports = router;