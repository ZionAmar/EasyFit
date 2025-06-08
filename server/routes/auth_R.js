// >> קובץ: routes/auth_R.js
// >> תיקון: הוספת נתיב /verify החיוני לסנכרון מחדש.

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth_C');
const { checkLoginRateLimit, isLoggedIn } = require('../middlewares/auth_Midd');

router.post('/login', checkLoginRateLimit, authController.login);
router.post('/register', authController.register);
router.get('/logout', authController.logout);

// ADDED: נתיב חיוני לבדיקת ה-token בעת טעינת האפליקציה מחדש
router.get('/verify', isLoggedIn, authController.verify);

module.exports = router;
