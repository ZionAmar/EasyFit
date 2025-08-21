const meetingService = require('../services/meeting_S');

const getMeetings = async (req, res, next) => {
    try {
        const { date } = req.query;
        // מעבירים את כל אובייקט המשתמש, שהוכן ע"י המידלוור וכולל סטודיו ותפקידים
        const meetings = await meetingService.getMeetingsForDashboard(req.user, date);
        res.json(meetings);
    } catch (err) {
        next(err);
    }
};

const getPublicSchedule = async (req, res, next) => {
    try {
        const { date, studioId } = req.query;
        if (!studioId) {
            return res.status(400).json({ message: 'studioId is required' });
        }
        const meetings = await meetingService.getPublicSchedule(studioId, date);
        res.json(meetings);
    } catch (err) {
        next(err);
    }
};

const createMeeting = async (req, res, next) => {
    try {
        const newMeeting = await meetingService.createMeeting(req.body, req.user);
        res.status(201).json(newMeeting);
    } catch (err) {
        next(err);
    }
};

const markTrainerArrival = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await meetingService.markTrainerArrival(id, req.user);
        res.status(200).json(result);
    } catch (err) {
        if (err.message === 'Unauthorized') {
            return res.status(403).json({ error: 'You are not authorized to perform this action' });
        }
        next(err);
    }
};

module.exports = {
    getMeetings,
    getPublicSchedule,
    createMeeting,
    markTrainerArrival
};