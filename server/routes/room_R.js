const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room_C');
const { isLoggedIn, requireRole } = require('../middlewares/auth_Midd');

router.get('/', isLoggedIn, roomController.getAllRooms);
router.get('/available', isLoggedIn, roomController.getAvailableRooms);
router.post('/', isLoggedIn, requireRole('admin'), roomController.createRoom);
router.put('/:id', isLoggedIn, requireRole('admin'), roomController.updateRoom);
router.delete('/:id', isLoggedIn, requireRole('admin'), roomController.deleteRoom);

module.exports = router;