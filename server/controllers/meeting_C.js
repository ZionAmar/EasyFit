const meetingService = require('../services/meeting_S');


const getMeetings = async (req, res, next) => {
    try {
        const { date, viewAs } = req.query; // הוספת viewAs
        const meetings = await meetingService.getMeetingsForDashboard(req.user, date, viewAs); // העברת viewAs
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

const getMeetingById = async (req, res, next) => {
    try {
        const meeting = await meetingService.getMeetingDetails(req.params.id);
        res.json(meeting);
    } catch (err) {
        next(err);
    }
};

const updateMeeting = async (req, res, next) => {
    try {
        const updatedMeeting = await meetingService.updateMeeting(req.params.id, req.body, req.user);
        res.json(updatedMeeting);
    } catch (err) {
        next(err);
    }
};

const deleteMeeting = async (req, res, next) => {
    try {
        await meetingService.deleteMeeting(req.params.id, req.user);
        res.status(204).send(); 
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getMeetings,
    getPublicSchedule,
    createMeeting,
    markTrainerArrival,
    getMeetingById,
    updateMeeting,
    deleteMeeting
};