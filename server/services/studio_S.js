// קובץ: server/services/studio_S.js
const studioModel = require('../models/studio_M');
const userModel = require('../models/user_M');

const getManagerDashboardDetails = async (managerId) => {
    const [studioDetails, [[userDetails]]] = await Promise.all([
        studioModel.getStudioByManagerId(managerId),
        userModel.getById(managerId)
    ]);

    if (!studioDetails) {
        const error = new Error("Forbidden: User is not an admin of any studio or studio not found.");
        error.status = 403;
        throw error;
    }

    return {
        user: { id: userDetails.id, full_name: userDetails.full_name, email: userDetails.email },
        studio: studioDetails
    };
};

const getDashboardStats = async (studioId) => {
    return studioModel.getDashboardStats(studioId);
};

// --- פונקציה חדשה ---
const getTodaysSchedule = async (studioId) => {
    return studioModel.getTodaysScheduleByStudio(studioId);
};

module.exports = {
    getManagerDashboardDetails,
    getDashboardStats,
    getTodaysSchedule // <- הוספה לייצוא
};