const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room_C');
const { isLoggedIn } = require('../middlewares/auth_Midd');

// רק משתמש מחובר יכול לראות את רשימת החדרים
router.get('/', isLoggedIn, roomController.getAllRooms);

module.exports = router;