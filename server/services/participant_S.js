const meetingModel = require('../models/meeting_M');
const participantModel = require('../models/participant_M');
const smsService = require('../utils/sms_S'); 

async function processWaitingList(meetingId) {
    const [[meeting]] = await meetingModel.getById(meetingId);
    if (!meeting || meeting.participant_count >= meeting.capacity) { return; }
    const [[nextInLine]] = await participantModel.getNextInWaitingList(meetingId);
    if (!nextInLine) { return; }
    await participantModel.updateRegistrationStatus(nextInLine.registration_id, 'pending');
    await smsService.sendSmsWithConfirmLink(nextInLine.phone, meetingId, nextInLine.registration_id);
}

const addParticipant = async (userId, meetingId, forceWaitlist = false) => {
    const [[meeting]] = await meetingModel.getById(meetingId);
    if (!meeting) {
        const error = new Error('השיעור המבוקש לא נמצא.');
        error.status = 404;
        throw error;
    }
    const [[existing]] = await participantModel.findExisting(userId, meetingId);
    if (existing) {
        const error = new Error('אתה כבר רשום לשיעור זה או נמצא ברשימת ההמתנה.');
        error.status = 409;
        error.errorType = 'ALREADY_REGISTERED';
        throw error;
    }

    const isFull = meeting.participant_count >= meeting.capacity;

    if (isFull && !forceWaitlist) {
        const waitingList = await meetingModel.getWaitingParticipants(meetingId);
        const waitlistCount = waitingList.length;

        const message = `השיעור מלא. ${waitlistCount > 0 ? `כבר יש ${waitlistCount} אנשים ברשימת ההמתנה.` : ''} האם תרצה להצטרף?`;
        
        const error = new Error(message);
        error.status = 409;
        error.errorType = 'CLASS_FULL';
        error.waitlistCount = waitlistCount;
        throw error;
    }

    const status = isFull ? 'waiting' : 'active';
    const [result] = await participantModel.add(userId, meetingId, status);
    if (status === 'active') {
        await meetingModel.syncParticipantCount(meetingId);
    }
    return { id: result.insertId, userId, meetingId, status };
};

const cancelRegistration = async (registrationId, user) => {
    const [[registration]] = await participantModel.getRegistrationById(registrationId);
    if (!registration) {
        const error = new Error('ההרשמה לא נמצאה.');
        error.status = 404;
        throw error;
    }
    if (registration.user_id !== user.id && !user.roles.includes('admin')) {
        const error = new Error('אין לך הרשאה לבטל הרשמה זו.');
        error.status = 403;
        throw error;
    }
    await participantModel.updateRegistrationStatus(registrationId, 'cancelled');
    await meetingModel.syncParticipantCount(registration.meeting_id);
    await processWaitingList(registration.meeting_id);
    return { message: 'ההרשמה בוטלה בהצלחה.' };
};

const checkInParticipant = async (registrationId, user) => {
    const [[registration]] = await participantModel.getRegistrationById(registrationId);
    if (!registration) {
        const error = new Error('ההרשמה לא נמצאה.');
        error.status = 404;
        throw error;
    }
    
    const [[meeting]] = await meetingModel.getById(registration.meeting_id);
    if (!meeting) {
        const error = new Error('השיעור לא נמצא.');
        error.status = 404;
        throw error;
    }
    
    if (user.id !== meeting.trainer_id && !user.roles.includes('admin')) {
        const error = new Error('אין לך הרשאה לבצע צ\'ק-אין לשיעור זה.');
        error.status = 403;
        throw error;
    }

    await participantModel.setCheckInTime(registrationId);
    
    return { message: 'המתאמן עודכן בהצלחה.' };
};

const confirmSpot = async (registrationId) => {
    const [[registration]] = await participantModel.getRegistrationById(registrationId);
    if (!registration) {
        const error = new Error('ההרשמה לא נמצאה.');
        error.status = 404;
        throw error;
    }
    if (registration.status !== 'pending') {
        const error = new Error('המקום הזה כבר לא זמין.');
        error.status = 409;
        throw error;
    }
    const [[meeting]] = await meetingModel.getById(registration.meeting_id);
    if (meeting.participant_count >= meeting.capacity) {
        await participantModel.updateRegistrationStatus(registrationId, 'waiting');
        const error = new Error('מצטערים, המקום נתפס. הוחזרת לרשימת ההמתנה.');
        error.status = 409;
        throw error;
    }
    await participantModel.updateRegistrationStatus(registrationId, 'active');
    await meetingModel.syncParticipantCount(registration.meeting_id);
    return { message: 'המקום אושר בהצלחה.' };
};

const declineSpot = async (registrationId) => {
    const [[registration]] = await participantModel.getRegistrationById(registrationId);
    if (!registration) {
        const error = new Error('ההרשמה לא נמצאה.');
        error.status = 404;
        throw error;
    }
    if (registration.status === 'pending') {
        await participantModel.updateRegistrationStatus(registrationId, 'cancelled');
        await processWaitingList(registration.meeting_id);
    }
    return { message: 'המקום נדחה.' };
};

module.exports = {
    addParticipant,
    cancelRegistration,
    processWaitingList,
    checkInParticipant,
    confirmSpot,
    declineSpot
};