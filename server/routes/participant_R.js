const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participant_C');
const { isLoggedIn, requireRole } = require('../middlewares/auth_Midd');

router.post('/', isLoggedIn, requireRole('member'), participantController.add);
router.delete('/:registrationId', isLoggedIn, requireRole('member', 'admin'), participantController.cancel);
router.patch('/:registrationId/check-in', isLoggedIn, requireRole('trainer', 'admin'), participantController.checkIn);

router.get('/confirm/:registrationId', participantController.confirmSpot);
router.get('/decline/:registrationId', participantController.declineSpot);

module.exports = router;