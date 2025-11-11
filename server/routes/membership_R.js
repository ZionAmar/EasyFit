const express = require('express');
const router = express.Router();
const membershipController = require('../controllers/membership_C');
const { isLoggedIn, requireRole } = require('../middlewares/auth_Midd');

router.use(isLoggedIn);
router.get('/user/:userId', membershipController.getMembershipsForUser);
router.post('/', requireRole('admin', 'owner'), membershipController.assignMembership);

module.exports = router;