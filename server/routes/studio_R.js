// קובץ: server/routes/studio_R.js
const express = require('express');
const router = express.Router();
const studioController = require('../controllers/studio_C');
const { isLoggedIn, requireRole } = require('../middlewares/auth_Midd');

router.get('/dashboard', isLoggedIn, requireRole('admin'), studioController.getDashboard);
router.get('/dashboard/stats', isLoggedIn, requireRole('admin'), studioController.getStats);
router.get('/daily-schedule', isLoggedIn, requireRole('admin'), studioController.getTodaysSchedule);

// --- הנתיבים החדשים ---
// נתיב לקבלת כל הגדרות הסטודיו
router.get('/settings', isLoggedIn, requireRole('admin'), studioController.getStudioSettings);
// נתיב לעדכון כל הגדרות הסטודיו
router.put('/settings', isLoggedIn, requireRole('admin'), studioController.updateStudioSettings);

module.exports = router;