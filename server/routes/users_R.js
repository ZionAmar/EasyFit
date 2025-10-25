const express = require('express');
const router = express.Router();
const controller = require('../controllers/user_C');
const { isLoggedIn, requireRole } = require('../middlewares/auth_Midd');
const upload = require('../middlewares/upload_Midd'); 

// --- Owner-Specific User Management Routes ---
router.get('/system/all', isLoggedIn, requireRole('owner'), controller.getAllSystemUsers);
router.put('/system/update/:id', isLoggedIn, requireRole('owner'), controller.ownerUpdateUser);
router.delete('/system/delete/:id', isLoggedIn, requireRole('owner'), controller.ownerDeleteUser);
router.post('/system/roles/:userId', isLoggedIn, requireRole('owner'), controller.ownerAssignRole);
router.delete('/system/roles/:userId/:studioId/:roleName', isLoggedIn, requireRole('owner'), controller.ownerRemoveRole);


// --- Admin & General User Routes ---
router.put('/profile', isLoggedIn, upload.single('profile_picture'), controller.updateProfile);
router.get('/assignable-roles', isLoggedIn, requireRole('admin'), controller.getAssignableRoles);

router.get('/all', isLoggedIn, requireRole('admin'), controller.getUsersForStudio); 
router.get('/available-trainers', isLoggedIn, requireRole('admin'), controller.getAvailableTrainers);
router.get("/:id", isLoggedIn, requireRole('admin'), controller.getUserById);
router.post('/', isLoggedIn, requireRole('admin'), controller.createUser);
router.put("/:id", isLoggedIn, requireRole('admin'), controller.updateUser);
router.delete("/:id", isLoggedIn, requireRole('admin'), controller.deleteUser);
router.get('/by-studio/:studioId', isLoggedIn, requireRole('owner'), controller.getUsersByStudio);
router.post('/system/create', isLoggedIn, requireRole('owner'), controller.ownerCreateUser);

module.exports = router;