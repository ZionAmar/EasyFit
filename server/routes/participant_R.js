const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participant_C');
const { isLoggedIn, requireRole } = require('../middlewares/auth_Midd');

router.post('/', isLoggedIn, requireRole('member'), participantController.add);
router.patch('/:participantId/status', isLoggedIn, requireRole('trainer', 'admin'), participantController.updateStatus);

module.exports = router;