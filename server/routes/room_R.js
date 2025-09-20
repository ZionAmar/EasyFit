const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room_C');
const { isLoggedIn } = require('../middlewares/auth_Midd');

router.get('/', isLoggedIn, roomController.getAllRooms);
router.get('/available', isLoggedIn, roomController.getAvailableRooms);

module.exports = router;