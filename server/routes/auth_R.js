const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth_C');
const { checkLoginRateLimit, isLoggedIn } = require('../middlewares/auth_Midd');

router.post('/login', checkLoginRateLimit, authController.login);
router.post('/register', authController.register);
router.get('/logout', authController.logout);
router.get('/verify', isLoggedIn, authController.verify);

module.exports = router;
