const express = require('express');
const router = express.Router();
const studioController = require('../controllers/studio_C');
const { isLoggedIn, requireRole } = require('../middlewares/auth_Midd');

router.get('/dashboard', isLoggedIn, requireRole('admin'), studioController.getDashboard);
router.get('/dashboard/stats', isLoggedIn, requireRole('admin'), studioController.getStats);
router.get('/daily-schedule', isLoggedIn, requireRole('admin'), studioController.getTodaysSchedule);
router.get('/settings', isLoggedIn, requireRole('admin'), studioController.getStudioSettings);
router.put('/settings', isLoggedIn, requireRole('admin'), studioController.updateStudioSettings);
router.get('/all', isLoggedIn, requireRole('owner'), studioController.getAllStudios);
router.post('/', isLoggedIn, requireRole('owner'), studioController.createStudio);
router.put('/:id', isLoggedIn, requireRole('owner'), studioController.updateStudio);
router.delete('/:id', isLoggedIn, requireRole('owner'), studioController.deleteStudio);
router.put('/:id/assign-admin', isLoggedIn, requireRole('owner'), studioController.assignNewAdmin);

module.exports = router;