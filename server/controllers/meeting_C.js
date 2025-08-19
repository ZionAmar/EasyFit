const meetingService = require('../services/meeting_S');

const getMeetings = async (req, res, next) => {
    try {
        const { date, role } = req.query; 
        const meetings = await meetingService.getMeetingsForUser(req.user, date, role);
        res.json(meetings);
    } catch (err) {
        next(err);
    }
};

const getPublicSchedule = async (req, res, next) => {
    try {
        const { date } = req.query;
        const meetings = await meetingService.getPublicSchedule(date);
        res.json(meetings);
    } catch (err) {
        next(err);
    }
};

const createMeeting = async (req, res, next) => {
    try {
        const meetingData = { ...req.body, trainer_id: req.user.id };
        const newMeeting = await meetingService.createMeeting(meetingData);
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
            res.status(403).json({ error: 'You are not authorized to perform this action' });
        } else {
            next(err);
        }
    }
};

module.exports = {
    getMeetings,
    getPublicSchedule,
    createMeeting,
    markTrainerArrival
};