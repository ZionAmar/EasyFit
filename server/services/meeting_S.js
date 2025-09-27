const meetingModel = require('../models/meeting_M');

const getMeetingsForDashboard = async (user, date, viewAs) => {
    const { id: userId, studioId, roles } = user;
    if (!studioId) {
        throw new Error("No studio selected.");
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
        throw new Error('החדר כבר תפוס בשעה המבוקשת.');
    }

    const overlappingTrainer = await meetingModel.findOverlappingMeetingForTrainer(meetingInfo);
    if (overlappingTrainer.length > 0) {
        throw new Error(`המאמן ${overlappingTrainer[0].trainerName} כבר משובץ למפגש '${overlappingTrainer[0].name}' בזמן זה.`);
    }

    const busyParticipants = await meetingModel.findOverlappingMeetingsForParticipants(meetingInfo, participantIds);
    if (busyParticipants.length > 0) {
        const names = busyParticipants.map(p => p.full_name).join(', ');
        throw new Error(`המתאמנים הבאים כבר רשומים למפגש אחר בזמן זה: ${names}.`);
    }

    const result = await meetingModel.create(meetingInfo, participantIds);
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
    const [[meeting]] = await meetingModel.getById(meetingId);
    if (!meeting) throw new Error('Meeting not found');

    const participants = await meetingModel.getActiveParticipants(meetingId);
    
    const waitingList = await meetingModel.getWaitingParticipants(meetingId);

    return { ...meeting, participants, waitingList };
};


const updateMeeting = async (meetingId, data, user) => {
    const { participantIds, ...meetingData } = data;
    const meetingInfo = { ...meetingData, studio_id: user.studioId };

    const [overlappingRoom] = await meetingModel.findOverlappingMeeting(meetingInfo);
    if (overlappingRoom.length > 0 && overlappingRoom[0].id != meetingId) {
        throw new Error('החדר כבר תפוס בשעה המבוקשת.');
    }

    const overlappingTrainer = await meetingModel.findOverlappingMeetingForTrainer(meetingInfo, meetingId);
    if (overlappingTrainer.length > 0) {
        throw new Error(`המאמן ${overlappingTrainer[0].trainerName} כבר משובץ למפגש '${overlappingTrainer[0].name}' בזמן זה.`);
    }

    const busyParticipants = await meetingModel.findOverlappingMeetingsForParticipants(meetingInfo, participantIds, meetingId);
     if (busyParticipants.length > 0) {
        const names = busyParticipants.map(p => p.full_name).join(', ');
        throw new Error(`המתאמנים הבאים כבר רשומים למפגש אחר בזמן זה: ${names}.`);
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