const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participant_C');
const { isLoggedIn, requireRole } = require('../middlewares/auth_Midd');

// נתיב להוספת משתתף לשיעור
router.post('/', isLoggedIn, requireRole('member'), participantController.add);

// נתיב לעדכון סטטוס (צ'ק-אין) על ידי מאמן/מנהל
router.patch('/:participantId/status', isLoggedIn, requireRole('trainer', 'admin'), participantController.updateStatus);

module.exports = router;