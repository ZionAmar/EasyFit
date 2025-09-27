const meetingModel = require('../models/meeting_M');
const participantModel = require('../models/participant_M');
const smsService = require('./sms_S'); 

async function processWaitingList(meetingId) {
    const [[meeting]] = await meetingModel.getById(meetingId);
    if (!meeting || meeting.participant_count >= meeting.capacity) { return; }
    const [[nextInLine]] = await participantModel.getNextInWaitingList(meetingId);
    if (!nextInLine) { return; }
    await participantModel.updateRegistrationStatus(nextInLine.registration_id, 'pending');
    await smsService.sendSmsWithConfirmLink(nextInLine.phone, meetingId, nextInLine.registration_id);
}

const addParticipant = async (userId, meetingId) => {
    const [[meeting]] = await meetingModel.getById(meetingId);
    if (!meeting) throw new Error('השיעור המבוקש לא נמצא.');
    const [[existing]] = await participantModel.findExisting(userId, meetingId);
    if (existing) throw new Error('אתה כבר רשום לשיעור זה או נמצא ברשימת ההמתנה.');
    const isFull = meeting.participant_count >= meeting.capacity;
    const status = isFull ? 'waiting' : 'active';
    const [result] = await participantModel.add(userId, meetingId, status);
    if (status === 'active') {
        await meetingModel.syncParticipantCount(meetingId);
    }
    return { id: result.insertId, userId, meetingId, status };
};

const cancelRegistration = async (registrationId, user) => {
    const [[registration]] = await participantModel.getRegistrationById(registrationId);
    if (!registration) throw new Error('ההרשמה לא נמצאה.');
    if (registration.user_id !== user.id && !user.roles.includes('admin')) {
        throw new Error('אין לך הרשאה לבטל הרשמה זו.');
    }
    await participantModel.updateRegistrationStatus(registrationId, 'cancelled');
    await meetingModel.syncParticipantCount(registration.meeting_id);
    await processWaitingList(registration.meeting_id);
    return { message: 'ההרשמה בוטלה בהצלחה.' };
};

const checkInParticipant = async (registrationId, user) => {
    const [[registration]] = await participantModel.getRegistrationById(registrationId);
    if (!registration) throw new Error('ההרשמה לא נמצאה.');
    
    const [[meeting]] = await meetingModel.getById(registration.meeting_id);
    if (!meeting) throw new Error('השיעור לא נמצא.');
    
    if (user.id !== meeting.trainer_id && !user.roles.includes('admin')) {
        throw new Error('אין לך הרשאה לבצע צ\'ק-אין לשיעור זה.');
    }

    await participantModel.setCheckInTime(registrationId);
    
    return { message: 'המתאמן עודכן בהצלחה.' };
};

const confirmSpot = async (registrationId) => {
    const [[registration]] = await participantModel.getRegistrationById(registrationId);
    if (!registration) throw new Error('ההרשמה לא נמצאה.');
    if (registration.status !== 'pending') throw new Error('המקום הזה כבר לא זמין.');
    const [[meeting]] = await meetingModel.getById(registration.meeting_id);
    if (meeting.participant_count >= meeting.capacity) {
        await participantModel.updateRegistrationStatus(registrationId, 'waiting');
        throw new Error('מצטערים, המקום נתפס. הוחזרת לרשימת ההמתנה.');
    }
    await participantModel.updateRegistrationStatus(registrationId, 'active');
    await meetingModel.syncParticipantCount(registration.meeting_id);
    return { message: 'המקום אושר בהצלחה.' };
};

const declineSpot = async (registrationId) => {
    const [[registration]] = await participantModel.getRegistrationById(registrationId);
    if (!registration) throw new Error('ההרשמה לא נמצאה.');
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