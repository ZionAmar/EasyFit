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

const registerStudio = async (req, res, next) => {
    try {
        const result = await studioService.registerNewStudio(req.body);
        res.status(201).json({ message: "Studio registered successfully", data: result });
    } catch (err) {
        next(err);
    }
};

const getAllStudios = async (req, res, next) => {
    try {
        const studios = await studioService.getAllStudios();
        res.json(studios);
    } catch (err) {
        next(err);
    }
};

const createStudio = async (req, res, next) => {
    try {
        const newStudio = await studioService.createStudio(req.body);
        res.status(201).json(newStudio);
    } catch (err) {
        next(err);
    }
};

const updateStudio = async (req, res, next) => {
    try {
        const updatedStudio = await studioService.updateStudio(req.params.id, req.body);
        res.json(updatedStudio);
    } catch (err) {
        next(err);
    }
};

const deleteStudio = async (req, res, next) => {
    try {
        await studioService.deleteStudio(req.params.id);
        res.status(204).send();
    } catch (err) {
        next(err);
    }
};

const assignNewAdmin = async (req, res, next) => {
    try {
        const { id: studioId } = req.params;
        const { newAdminId } = req.body;
        const result = await studioService.assignNewAdmin({ studioId, newAdminId });
        res.json(result);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getDashboard,
    getStats,
    getTodaysSchedule, 
    getStudioSettings,   
    updateStudioSettings,
    registerStudio,
    getAllStudios,
    createStudio,
    updateStudio,
    deleteStudio,
    assignNewAdmin 
};