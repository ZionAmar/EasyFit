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
        
        const result = await participantService.updateStatus(participantId, status, req.user);
        
        res.status(200).json(result);
    } catch (err) {
        if (err.message === 'Unauthorized') {
           return res.status(403).json({ message: 'You are not authorized to perform this action.' });
        }
        next(err);
    }
}

module.exports = { 
    add, 
    updateStatus 
};