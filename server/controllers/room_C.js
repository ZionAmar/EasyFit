// קובץ: server/controllers/room_C.js (מעודכן)
const roomModel = require('../models/room_M');

async function getAllRooms(req, res, next) {
    try {
        const [rooms] = await roomModel.getAll(req.user.studioId);
        res.json(rooms);
    } catch (err) {
        next(err);
    }
}

// --- פונקציה חדשה ---
async function getAvailableRooms(req, res, next) {
    try {
        const { studioId } = req.user;
        const { date, start_time, end_time, meetingId } = req.query;
        
        const [rooms] = await roomModel.findAvailable({ 
            studioId, date, start_time, end_time, excludeMeetingId: meetingId 
        });
        res.json(rooms);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getAllRooms,
    getAvailableRooms // <-- הוספה לייצוא
};