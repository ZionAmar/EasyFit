const meetingModel = require('../models/meeting_M');
const studioConfig = require('../config/studio_config');

const getMeetingsForUser = async (user, date, requestedRole) => {
    const roleToUse = requestedRole || (user.roles.includes('admin') ? 'admin' : user.roles.includes('trainer') ? 'trainer' : 'member');

    if (!user.roles.includes(roleToUse)) {
        return [];
    }

    switch (roleToUse) {
        case 'admin': {
            const [adminMeetings] = await meetingModel.getPublicSchedule(date);
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

const getPublicSchedule = async (date) => {
    const [meetings] = await meetingModel.getPublicSchedule(date);
    return meetings;
};

const createMeeting = async (meetingData) => {
    // שלב 1: בדיקת שעות פעילות
    const { start_time, end_time } = meetingData;
    const { OPEN, CLOSE } = studioConfig.OPERATING_HOURS;

    if (start_time < OPEN || end_time > CLOSE) {
        throw new Error(`שעות הפעילות הן בין ${OPEN.slice(0,5)} ל-${CLOSE.slice(0,5)}.`);
    }

    // שלב 2: בדיקת התנגשות חדרים
    const [overlapping] = await meetingModel.findOverlappingMeeting(meetingData);
    if (overlapping.length > 0) {
        throw new Error('החדר תפוס בזמן המבוקש. אנא בחר זמן או חדר אחר.');
    }

    // שלב 3: יצירת השיעור
    const [result] = await meetingModel.create(meetingData);
    return { id: result.insertId, ...meetingData };
};

module.exports = {
    getMeetingsForUser,
    getPublicSchedule,
    createMeeting
};