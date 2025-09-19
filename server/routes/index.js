const express = require('express');
const router = express.Router();

// מאחדים את כל הראוטרים תחת ראוטר מרכזי אחד
router.use('/auth', require('./auth_R'));
router.use('/users', require('./users_R'));
router.use('/meetings', require('./meetings_R'));
router.use('/rooms', require('./room_R'));
router.use('/participants', require('./participant_R')); // <-- שינוי כאן
router.use('/studio', require('./studio_R'));
router.use('/roles', require('./roles_R')); // <-- הוסף את השורה הזו

module.exports = router;