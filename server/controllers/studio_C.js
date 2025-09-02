// קובץ: server/controllers/studio_C.js
const studioService = require('../services/studio_S');

const getDashboard = async (req, res, next) => {
    try {
        const managerId = req.user.id;
        const dashboardData = await studioService.getManagerDashboardDetails(managerId);
        res.json(dashboardData);
    } catch (err) {
        next(err);
    }
};

const getStats = async (req, res, next) => {
    try {
        const stats = await studioService.getDashboardStats(req.user.studioId);
        res.json(stats);
    } catch (err) {
        next(err);
    }
};

// --- פונקציה חדשה ---
const getTodaysSchedule = async (req, res, next) => {
    try {
        const schedule = await studioService.getTodaysSchedule(req.user.studioId);
        res.json(schedule);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getDashboard,
    getStats,
    getTodaysSchedule // <- הוספה לייצוא
};