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

const getTodaysSchedule = async (req, res, next) => {
    try {
        const schedule = await studioService.getTodaysSchedule(req.user.studioId);
        res.json(schedule);
    } catch (err) {
        next(err);
    }
};

const getStudioSettings = async (req, res, next) => {
    try {
        const settings = await studioService.getFullSettings(req.user.studioId);
        res.json(settings);
    } catch (err) {
        next(err);
    }
};

const updateStudioSettings = async (req, res, next) => {
    try {
        const result = await studioService.updateFullSettings(req.user.studioId, req.body);
        res.json({ message: 'הגדרות הסטודיו עודכנו בהצלחה', data: result });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getDashboard,
    getStats,
    getTodaysSchedule, 
    getStudioSettings,   
    updateStudioSettings   
};