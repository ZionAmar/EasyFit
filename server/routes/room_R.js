// קובץ: server/routes/room_R.js (מעודכן)
const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room_C');
const { isLoggedIn } = require('../middlewares/auth_Midd');

// נתיב קיים
router.get('/', isLoggedIn, roomController.getAllRooms);

// --- נתיב חדש ---
// נתיב זה יקבל פרמטרים ויחזיר רק חדרים פנויים
router.get('/available', isLoggedIn, roomController.getAvailableRooms);

module.exports = router;