const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meeting_C');
const { isLoggedIn } = require('../middlewares/auth_Midd');

router.get('/', isLoggedIn, meetingController.getMeetings);

module.exports = router;