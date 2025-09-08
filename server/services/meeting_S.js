const meetingModel = require('../models/meeting_M');

const getMeetingsForDashboard = async (user, date) => {
    const { id: userId, studioId, roles } = user;
    if (!studioId) {
        throw new Error("No studio selected.");
    }

    if (roles.includes('admin')) {
        const adminMeetings = await meetingModel.getAllByStudioId(studioId, date);
        return Promise.all(adminMeetings.map(async (meeting) => {
            const participants = await meetingModel.getActiveParticipants(meeting.id);
            const waitingList = await meetingModel.getWaitingParticipants(meeting.id);
            return { ...meeting, participants, waitingList };
        }));
    }

    let meetingsMap = new Map();

    if (roles.includes('member')) {
        const memberMeetings = await meetingModel.getByMemberId(userId, studioId, date);
        memberMeetings.forEach(meeting => meetingsMap.set(meeting.id, meeting));
    }

    if (roles.includes('trainer')) {
        const trainerMeetings = await meetingModel.getByTrainerId(userId, studioId, date);
        trainerMeetings.forEach(meeting => {
            const existingMeeting = meetingsMap.get(meeting.id);
            if (existingMeeting) {
                // ###  זה התיקון המרכזי ###
                // אם השיעור קיים, מזג את המידע החדש לתוך הישן
                // זה ישמור על ה-'status' מהרישום ויוסיף את ה-'trainer_arrival_time'
                meetingsMap.set(meeting.id, { ...meeting, ...existingMeeting });
            } else {
                // אם השיעור לא קיים, פשוט הוסף אותו
                meetingsMap.set(meeting.id, meeting);
            }
        });
    }

    const allUserMeetings = Array.from(meetingsMap.values());

    const meetingsWithData = await Promise.all(allUserMeetings.map(async (meeting) => {
        if (roles.includes('trainer') && meeting.trainer_id === userId) {
            const participants = await meetingModel.getActiveParticipants(meeting.id);
            const waitingList = await meetingModel.getWaitingParticipants(meeting.id);
            return { ...meeting, participants, waitingList };
        }
        return meeting;
    }));

    return meetingsWithData;
};

const getPublicSchedule = async (studioId, date) => {
    const [meetings] = await meetingModel.getPublicSchedule(studioId, date);
    return meetings;
};

const createMeeting = async (meetingData, user) => {
    const meetingInfo = { 
        ...meetingData, 
        studio_id: user.studioId,
    };
    
    const [overlapping] = await meetingModel.findOverlappingMeeting(meetingInfo);
    if (overlapping.length > 0) {
        throw new Error('The room is already booked for the requested time.');
    }

    const [result] = await meetingModel.create(meetingInfo);
    return { id: result.insertId, ...meetingInfo };
};

const markTrainerArrival = async (meetingId, user) => {
    const [[meeting]] = await meetingModel.getById(meetingId);
    if (!meeting) {
        throw new Error('Meeting not found');
    }

    if (user.studioId !== meeting.studio_id) {
        throw new Error('Unauthorized');
    }
    if (meeting.trainer_id !== user.id && !user.roles.includes('admin')) {
        throw new Error('Unauthorized');
    }

    await meetingModel.markTrainerArrival(meetingId);
    return { message: 'Trainer arrival marked successfully' };
};

const getMeetingDetails = async (meetingId) => {
    const [[meeting]] = await meetingModel.getByIdWithParticipants(meetingId);
    if (!meeting) throw new Error('Meeting not found');

    // הקוד המעודכן שיודע לקרוא את התוצאה החדשה
    if (meeting.participantIds && typeof meeting.participantIds === 'string') {
        // הופך מחרוזת כמו "1,5,12" למערך של מספרים [1, 5, 12]
        meeting.participantIds = meeting.participantIds.split(',').map(Number);
    } else {
        // אם אין משתתפים, יוצר מערך ריק
        meeting.participantIds = [];
    }
    return meeting;
};

const updateMeeting = async (meetingId, data, user) => {
    // הפרדת המידע: פרטי השיעור ורשימת המשתתפים
    const { participantIds, ...meetingData } = data;
    meetingData.studio_id = user.studioId;
    
    // בדיקת חפיפה (בדומה ליצירת שיעור, אך יש לוודא שהבדיקה לא כוללת את השיעור הנוכחי)
    const [overlapping] = await meetingModel.findOverlappingMeeting(meetingData);
    if (overlapping.length > 0 && overlapping[0].id != meetingId) {
        throw new Error('The room is already booked for the requested time.');
    }

    await meetingModel.update(meetingId, meetingData, participantIds);
    return getMeetingDetails(meetingId); // החזרת המידע המעודכן
};

const deleteMeeting = async (meetingId, user) => {
    // ניתן להוסיף כאן בדיקת הרשאות אם נדרש (למשל, לוודא שהשיעור שייך לסטודיו של המנהל)
    await meetingModel.remove(meetingId);
    return { message: 'Meeting deleted successfully' };
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
