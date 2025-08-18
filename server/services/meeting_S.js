const meetingModel = require('../models/meeting_M');

const getMeetingsForUser = async (user, date, requestedRole) => {
    const roleToUse = requestedRole || (user.roles.includes('admin') ? 'admin' : user.roles.includes('trainer') ? 'trainer' : 'member');

    if (!user.roles.includes(roleToUse)) {
        return [];
    }

    switch (roleToUse) {
        case 'admin': {
            const [adminMeetings] = await meetingModel.getAll(date);
            return adminMeetings;
        }
        case 'trainer': {
            const [trainerMeetings] = await meetingModel.getByTrainerId(user.id, date);
            const meetingsWithData = await Promise.all(trainerMeetings.map(async (meeting) => {
                const [participants] = await meetingModel.getActiveParticipants(meeting.id);
                const [waitingList] = await meetingModel.getWaitingParticipants(meeting.id);
                return { ...meeting, participants, waitingList };
            }));
            return meetingsWithData;
        }
        case 'member': {
            const [memberMeetings] = await meetingModel.getByMemberId(user.id, date);
            return memberMeetings;
        }
        default:
            return [];
    }
};

const getPublicSchedule = async (date) => { // מקבל עכשיו תאריך
    const [meetings] = await meetingModel.getPublicSchedule(date);
    return meetings;
};

const createMeeting = async (meetingData) => {
    // שלב 1: בדיקת התנגשות
    const [overlapping] = await meetingModel.findOverlappingMeeting(meetingData);
    if (overlapping.length > 0) {
        // אם מצאנו התנגשות, זורקים שגיאה שתעצור את התהליך
        throw new Error('החדר תפוס בזמן המבוקש. אנא בחר זמן או חדר אחר.');
    }

    // שלב 2: אם אין התנגשות, יוצרים את השיעור
    const [result] = await meetingModel.create(meetingData);
    return { id: result.insertId, ...meetingData };
};

module.exports = {
    getMeetingsForUser,
    getPublicSchedule,
    createMeeting
};