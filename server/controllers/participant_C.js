const participantService = require('../services/participant_S');

async function add(req, res, next) {
    try {
        const userId = req.user.id;
        const { meetingId } = req.body;
        const newParticipant = await participantService.addParticipant(userId, meetingId);
        res.status(201).json(newParticipant);
    } catch (err) {
        next(err); 
    }
}

async function cancel(req, res, next) {
    try {
        const { registrationId } = req.params;
        const result = await participantService.cancelRegistration(registrationId, req.user);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}

async function checkIn(req, res, next) {
    try {
        const { registrationId } = req.params;
        const result = await participantService.checkInParticipant(registrationId, req.user);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}

async function confirmSpot(req, res, next) {
    try {
        const { registrationId } = req.params;
        await participantService.confirmSpot(registrationId);
        res.redirect(`${process.env.BASE_URL}/booking-confirmed`);
    } catch (err) {
        res.redirect(`${process.env.BASE_URL}/booking-error?message=${encodeURIComponent(err.message)}`);
    }
}

async function declineSpot(req, res, next) {
    try {
        const { registrationId } = req.params;
        await participantService.declineSpot(registrationId);
        res.redirect(`${process.env.BASE_URL}/booking-declined`);
    } catch (err) {
        res.redirect(`${process.env.BASE_URL}/booking-error?message=${encodeURIComponent(err.message)}`);
    }
}

module.exports = {
    add,
    cancel,
    checkIn,
    confirmSpot,
    declineSpot
};