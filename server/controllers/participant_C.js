const participantService = require('../services/participant_S');
const participantModel = require('../models/participant_M');

async function add(req, res, next) {
    try {
        const userId = req.user.id;
        const { meetingId } = req.body;
        const newParticipant = await participantService.addParticipant(userId, meetingId);
        res.status(201).json(newParticipant);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function updateStatus(req, res, next) {
    try {
        const { participantId } = req.params;
        const { status } = req.body;

        await participantModel.updateStatus(participantId, status);
        res.status(200).json({ message: `Status updated to ${status}` });
    } catch (err) {
        next(err);
    }
}

module.exports = { 
    add, 
    updateStatus 
};