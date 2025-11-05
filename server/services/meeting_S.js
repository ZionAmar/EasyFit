const meetingModel = require('../models/meeting_M');

const getMeetingsForDashboard = async (user, date, viewAs) => {
    const { id: userId, studioId, roles } = user;
    if (!studioId) {
        const error = new Error("לא נבחר סטודיו פעיל.");
        error.status = 400;
        throw error;
    }

    const effectiveRole = viewAs || (roles.includes('admin') ? 'admin' : roles.includes('trainer') ? 'trainer' : 'member');

    if (effectiveRole === 'admin' || effectiveRole === 'trainer') {
        const meetings = effectiveRole === 'admin' 
            ? await meetingModel.getAllByStudioId(studioId, date) 
            : await meetingModel.getByTrainerId(userId, studioId, date);
            
        return Promise.all(meetings.map(async (meeting) => {
            const participants = await meetingModel.getActiveParticipants(meeting.id);
            const waitingList = await meetingModel.getWaitingParticipants(meeting.id);
            return { ...meeting, participants, waitingList };
        }));
    }

    if (effectiveRole === 'member') {
        const meetingsMap = new Map();
        const myMeetings = await meetingModel.getByMemberId(userId, studioId, date);
        myMeetings.forEach(meeting => meetingsMap.set(meeting.id, meeting));

        const [publicFutureMeetings] = await meetingModel.getPublicSchedule(studioId, date);
        publicFutureMeetings.forEach(meeting => {
            if (!meetingsMap.has(meeting.id)) {
                meetingsMap.set(meeting.id, meeting);
            }
        });
        return Array.from(meetingsMap.values());
    }

    return [];
};

const getPublicSchedule = async (studioId, date) => {
    const [meetings] = await meetingModel.getPublicSchedule(studioId, date);
    return meetings;
};

const createMeeting = async (data, user) => {
    const { participantIds, ...meetingData } = data;
    const meetingInfo = { ...meetingData, studio_id: user.studioId };

    const [overlappingRoom] = await meetingModel.findOverlappingMeeting(meetingInfo);
    if (overlappingRoom.length > 0) {
        const error = new Error('החדר כבר תפוס בשעה המבוקשת.');
        error.status = 409;
        error.field = 'room_id';
        throw error;
    }

    const overlappingTrainer = await meetingModel.findOverlappingMeetingForTrainer(meetingInfo);
    if (overlappingTrainer.length > 0) {
        const error = new Error(`המאמן ${overlappingTrainer[0].trainerName} כבר משובץ למפגש '${overlappingTrainer[0].name}' בזמן זה.`);
        error.status = 409;
        error.field = 'trainer_id';
        throw error;
    }

    const busyParticipants = await meetingModel.findOverlappingMeetingsForParticipants(meetingInfo, participantIds);
    if (busyParticipants.length > 0) {
        const names = busyParticipants.map(p => p.full_name).join(', ');
        const error = new Error(`המתאמנים הבאים כבר רשומים למפגש אחר בזמן זה: ${names}.`);
        error.status = 409;
        error.field = 'participantIds';
        throw error;
    }

    const result = await meetingModel.create(meetingInfo, participantIds);
    return { id: result.insertId, ...meetingInfo };
};

const markTrainerArrival = async (meetingId, user) => {
    const [[meeting]] = await meetingModel.getById(meetingId);
    if (!meeting) {
        const error = new Error('המפגש לא נמצא.');
        error.status = 404;
        throw error;
    }

    if (user.studioId !== meeting.studio_id) {
        const error = new Error('גישה אסורה: המפגש אינו שייך לסטודיו הנוכחי.');
        error.status = 403;
        throw error;
    }
    if (meeting.trainer_id !== user.id && !user.roles.includes('admin')) {
        const error = new Error('אינך מורשה לסמן הגעה למפגש זה. רק המאמן המשובץ או מנהל יכולים לבצע פעולה זו.');
        error.status = 403;
        throw error;
    }

    await meetingModel.markTrainerArrival(meetingId);
    return { message: 'הגעת המאמן סומנה בהצלחה' };
};

const getMeetingDetails = async (meetingId) => {
    const [[meeting]] = await meetingModel.getById(meetingId);
    if (!meeting) {
        const error = new Error('המפגש לא נמצא.');
        error.status = 404;
        throw error;
    }

    const participants = await meetingModel.getActiveParticipants(meetingId);
    const waitingList = await meetingModel.getWaitingParticipants(meetingId);
    const fullDetails = { ...meeting, participants, waitingList };
    console.log('--- SERVER CHECK ---', JSON.stringify(fullDetails, null, 2));
    return fullDetails;
};


const updateMeeting = async (meetingId, data, user) => {
    const { participantIds, ...meetingData } = data;
    const meetingInfo = { ...meetingData, studio_id: user.studioId };

    const [overlappingRoom] = await meetingModel.findOverlappingMeeting(meetingInfo);
    if (overlappingRoom.length > 0 && overlappingRoom[0].id != meetingId) {
        const error = new Error('החדר כבר תפוס בשעה המבוקשת.');
        error.status = 409;
        error.field = 'room_id';
        throw error;
    }

    const overlappingTrainer = await meetingModel.findOverlappingMeetingForTrainer(meetingInfo, meetingId);
    if (overlappingTrainer.length > 0) {
        const error = new Error(`המאמן ${overlappingTrainer[0].trainerName} כבר משובץ למפגש '${overlappingTrainer[0].name}' בזמן זה.`);
        error.status = 409;
        error.field = 'trainer_id';
        throw error;
    }

    const busyParticipants = await meetingModel.findOverlappingMeetingsForParticipants(meetingInfo, participantIds, meetingId);
    if (busyParticipants.length > 0) {
        const names = busyParticipants.map(p => p.full_name).join(', ');
        const error = new Error(`המתאמנים הבאים כבר רשומים למפגש אחר בזמן זה: ${names}.`);
        error.status = 409;
        error.field = 'participantIds';
        throw error;
    }

    await meetingModel.update(meetingId, meetingData, participantIds);
    return getMeetingDetails(meetingId); 
};

const deleteMeeting = async (meetingId, user) => {
    // ניתן להוסיף כאן בדיקה (כמו ב-markTrainerArrival) לוודא שהמפגש שייך לסטודיו או למשתמש המורשה
    // לצורך תיקון השגיאות: המחיקה נעשית אם המשתמש מורשה ברמת ה-middleware
    await meetingModel.remove(meetingId);
    return { message: 'המפגש נמחק בהצלחה' };
};

module.exports = {
    getMeetingsForDashboard,
    getPublicSchedule,
    createMeeting,
    markTrainerArrival,
    getMeetingDetails,
    updateMeeting,
    deleteMeeting
};