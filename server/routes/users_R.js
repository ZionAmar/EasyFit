const express = require('express');
const router = express.Router();
const controller = require('../controllers/user_C');
const { isLoggedIn, requireRole } = require('../middlewares/auth_Midd');

router.get('/', isLoggedIn, requireRole('admin'), controller.getAllUsers);

// The specific route must come BEFORE the dynamic ':id' route
router.get('/available-trainers', isLoggedIn, requireRole('admin'), controller.getAvailableTrainers);

router.get("/:id", isLoggedIn, requireRole('admin'), controller.getUserById);
router.post('/', isLoggedIn, requireRole('admin'), controller.createUser);
router.put("/:id", isLoggedIn, requireRole('admin'), controller.updateUser);
router.delete("/:id", isLoggedIn, requireRole('admin'), controller.deleteUser);

module.exports = router;