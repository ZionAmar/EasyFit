const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth_R'));
router.use('/users', require('./users_R'));
router.use('/meetings', require('./meetings_R'));
router.use('/rooms', require('./room_R'));
router.use('/participants', require('./participant_R'));
router.use('/studio', require('./studio_R'));
router.use('/roles', require('./roles_R')); 
router.use('/products', require('./product_R'));
router.use('/memberships', require('./membership_R'));

module.exports = router;