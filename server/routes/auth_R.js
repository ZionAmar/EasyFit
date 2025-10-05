const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth_C');
const { checkLoginRateLimit, isLoggedIn, requireRole } = require('../middlewares/auth_Midd');

router.post('/login', checkLoginRateLimit, authController.login);
router.post('/register', authController.register);
router.get('/logout', authController.logout);
router.get('/verify', isLoggedIn, authController.verify);
router.post('/impersonate/:userId', isLoggedIn, requireRole('owner'), authController.impersonate);

module.exports = router;
