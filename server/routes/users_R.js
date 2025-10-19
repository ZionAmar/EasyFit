const express = require('express');
const router = express.Router();
const controller = require('../controllers/user_C');
const { isLoggedIn, requireRole } = require('../middlewares/auth_Midd');
const upload = require('../middlewares/upload_Midd'); 

router.put('/profile', isLoggedIn, upload.single('profile_picture'), controller.updateProfile);
router.get('/all', isLoggedIn, requireRole('owner'), controller.getAllUsers);
router.get('/', isLoggedIn, requireRole('admin'), controller.getAllUsers);
router.get('/available-trainers', isLoggedIn, requireRole('admin'), controller.getAvailableTrainers);
router.get("/:id", isLoggedIn, requireRole('admin'), controller.getUserById);
router.post('/', isLoggedIn, requireRole('admin'), controller.createUser);
router.put("/:id", isLoggedIn, requireRole('admin'), controller.updateUser);
router.delete("/:id", isLoggedIn, requireRole('admin'), controller.deleteUser);
router.get('/by-studio/:studioId', isLoggedIn, requireRole('owner'), controller.getUsersByStudio);

module.exports = router;