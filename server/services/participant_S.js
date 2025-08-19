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

module.exports = {
    addParticipant
};