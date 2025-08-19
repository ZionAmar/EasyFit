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
    // שלב 1: ודא שהרישום קיים
    const [[registration]] = await participantModel.getRegistrationById(registrationId);
    if (!registration) {
        throw new Error('Registration not found');
    }

    // שלב 2: ודא שלמשתמש יש הרשאה לבצע את הפעולה
    const [[meeting]] = await meetingModel.getById(registration.meeting_id);
    if (!meeting) {
        throw new Error('Meeting associated with this registration not found');
    }

    // רק המאמן של השיעור או מנהל יכולים לבצע צ'ק-אין
    if (user.id !== meeting.trainer_id && !user.roles.includes('admin')) {
        throw new Error('Unauthorized');
    }

    // שלב 3: בצע את העדכון
    await participantModel.updateStatus(registrationId, newStatus);
    return { message: `Status for registration ${registrationId} updated successfully to ${newStatus}` };
};

module.exports = {
    addParticipant,
    updateStatus 
};