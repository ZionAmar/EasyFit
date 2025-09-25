const meetingModel = require('../models/meeting_M');

const getMeetingsForDashboard = async (user, date, viewAs) => { // הוספת viewAs
    const { id: userId, studioId, roles } = user;
    if (!studioId) {
        throw new Error("No studio selected.");
    }

    // קובעים מה התפקיד הפעיל. אם לא נשלח, ננחש לפי סדר עדיפות
    const effectiveRole = viewAs || (roles.includes('admin') ? 'admin' : roles.includes('trainer') ? 'trainer' : 'member');

    if (effectiveRole === 'admin') {
        const adminMeetings = await meetingModel.getAllByStudioId(studioId, date);
        return Promise.all(adminMeetings.map(async (meeting) => {
            const participants = await meetingModel.getActiveParticipants(meeting.id);
            const waitingList = await meetingModel.getWaitingParticipants(meeting.id);
            return { ...meeting, participants, waitingList };
        }));
    }

    if (effectiveRole === 'trainer') {
        const trainerMeetings = await meetingModel.getByTrainerId(userId, studioId, date);
        return Promise.all(trainerMeetings.map(async (meeting) => {
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

    if (meeting.participantIds && typeof meeting.participantIds === 'string') {
        meeting.participantIds = meeting.participantIds.split(',').map(Number);
    } else {
        meeting.participantIds = [];
    }
    return meeting;
};

const updateMeeting = async (meetingId, data, user) => {
    const { participantIds, ...meetingData } = data;
    meetingData.studio_id = user.studioId;
    
    const [overlapping] = await meetingModel.findOverlappingMeeting(meetingData);
    if (overlapping.length > 0 && overlapping[0].id != meetingId) {
        throw new Error('The room is already booked for the requested time.');
    }

    await meetingModel.update(meetingId, meetingData, participantIds);
    return getMeetingDetails(meetingId); 
};

const deleteMeeting = async (meetingId, user) => {
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