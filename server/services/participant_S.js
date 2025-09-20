const meetingModel = require('../models/meeting_M');
const participantModel = require('../models/participant_M');

const addParticipant = async (userId, meetingId) => {
    const [[meeting]] = await meetingModel.getById(meetingId);
    if (!meeting) {
        throw new Error('השיעור המבוקש לא נמצא.');
    }

    const [[existing]] = await participantModel.findExisting(userId, meetingId);
    if (existing) {
        throw new Error('אתה כבר רשום לשיעור זה או נמצא ברשימת ההמתנה.');
    }

    const isFull = meeting.participant_count >= meeting.capacity;
    const status = isFull ? 'waiting' : 'active';

    const [result] = await participantModel.add(userId, meetingId, status);
    
    if (status === 'active') {
        await meetingModel.syncParticipantCount(meetingId);
    }

    return { id: result.insertId, userId, meetingId, status };
};

const updateStatus = async (registrationId, newStatus, user) => {
    const [[registration]] = await participantModel.getRegistrationById(registrationId);
    if (!registration) {
        throw new Error('Registration not found');
    }

    const [[meeting]] = await meetingModel.getById(registration.meeting_id);
    if (!meeting) {
        throw new Error('Meeting associated with this registration not found');
    }

    if (user.id !== meeting.trainer_id && !user.roles.includes('admin')) {
        throw new Error('Unauthorized');
    }

    await participantModel.updateStatus(registrationId, newStatus);
    return { message: `Status for registration ${registrationId} updated successfully to ${newStatus}` };
};

module.exports = {
    addParticipant,
    updateStatus 
};