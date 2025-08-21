const db = require('../config/db_config');

const extractRows = (result) => result[0];

const getAllByStudioId = (studioId, date) => {
    let query = `
        SELECT 
            m.id, m.name, m.trainer_id, m.room_id, m.participant_count,
            CONCAT(m.date, 'T', m.start_time) as start,
            CONCAT(m.date, 'T', m.end_time) as end,
            u.full_name as trainerName,
            r.name as roomName,
            r.capacity,
            m.trainer_arrival_time
        FROM meetings m
        JOIN users u ON m.trainer_id = u.id
        JOIN rooms r ON m.room_id = r.id
        WHERE m.studio_id = ?
    `;
    const params = [studioId];
    if (date) {
        query += ' AND m.date = ?';
        params.push(date);
    }
    return db.query(query, params).then(extractRows);
};

const getByTrainerId = (trainerId, studioId, date) => {
    
    let query = `
        SELECT 
            m.id, m.name, m.trainer_id, m.room_id, m.participant_count,
            CONCAT(m.date, 'T', m.start_time) as start,
            CONCAT(m.date, 'T', m.end_time) as end,
            u.full_name as trainerName,
            r.name as roomName,
            r.capacity,
            m.trainer_arrival_time
        FROM meetings m
        JOIN users u ON m.trainer_id = u.id
        JOIN rooms r ON m.room_id = r.id
        WHERE m.trainer_id = ? AND m.studio_id = ?
    `;
    const params = [trainerId, studioId];
    if (date) {
        query += ' AND m.date = ?';
        params.push(date);
    }
    return db.query(query, params).then(extractRows);
};

// --- התיקון כאן: הוספת studioId ושימוש בו ---
const getByMemberId = (memberId, studioId, date) => {
    let query = `
        SELECT 
            m.id, m.name, m.trainer_id, m.room_id, m.participant_count,
            CONCAT(m.date, 'T', m.start_time) as start,
            CONCAT(m.date, 'T', m.end_time) as end,
            mr.status,
            u.full_name as trainerName,
            r.name as roomName
        FROM meetings AS m
        JOIN meeting_registrations AS mr ON m.id = mr.meeting_id
        JOIN users u ON m.trainer_id = u.id
        JOIN rooms r ON m.room_id = r.id
        WHERE mr.user_id = ? AND m.studio_id = ?
    `;
    const params = [memberId, studioId];
    if (date) {
        query += ' AND m.date = ?';
        params.push(date);
    }
    return db.query(query, params).then(extractRows);
};

const getPublicSchedule = (studioId, date) => {
    let query = `
        SELECT 
            m.id, m.name, u.full_name as trainerName, r.name as roomName, r.capacity, m.participant_count,
            CONCAT(m.date, 'T', m.start_time) as start,
            CONCAT(m.date, 'T', m.end_time) as end
        FROM meetings m
        JOIN users u ON m.trainer_id = u.id 
        JOIN rooms r ON m.room_id = r.id
        WHERE m.date >= CURDATE() AND m.studio_id = ?
    `;
    return db.query(query, [studioId]);
};

const getById = (id) => {
    const query = `SELECT m.*, r.capacity FROM meetings m JOIN rooms r ON m.room_id = r.id WHERE m.id = ?`;
    return db.query(query, [id]);
};

const findOverlappingMeeting = ({ date, start_time, end_time, room_id, studio_id }) => {
    const query = `SELECT id FROM meetings WHERE room_id = ? AND date = ? AND start_time < ? AND end_time > ? AND studio_id = ?`;
    return db.query(query, [room_id, date, end_time, start_time, studio_id]);
};

const create = ({ studio_id, name, trainer_id, date, start_time, end_time, room_id }) => {
    const query = `INSERT INTO meetings (studio_id, name, trainer_id, date, start_time, end_time, room_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    return db.query(query, [studio_id, name, trainer_id, date, start_time, end_time, room_id]);
};

const getActiveParticipants = (meetingId) => {
    const query = `
        SELECT u.id, u.full_name, mr.status, mr.id as registrationId, mr.check_in_time
        FROM users u 
        JOIN meeting_registrations mr ON u.id = mr.user_id 
        WHERE mr.meeting_id = ? AND mr.status IN ('active', 'checked_in')
    `;
    return db.query(query, [meetingId]).then(extractRows);
};

const getWaitingParticipants = (meetingId) => {
    const query = `SELECT u.id, u.full_name, mr.status, mr.id as registrationId FROM users u JOIN meeting_registrations mr ON u.id = mr.user_id WHERE mr.meeting_id = ? AND mr.status = 'waiting'`;
    return db.query(query, [meetingId]).then(extractRows);
};

const markTrainerArrival = (meetingId) => {
    const query = `UPDATE meetings SET trainer_arrival_time = NOW() WHERE id = ? AND trainer_arrival_time IS NULL`;
    return db.query(query, [meetingId]);
};

module.exports = {
    getAllByStudioId,
    getByTrainerId,
    getByMemberId,
    getPublicSchedule,
    getActiveParticipants,
    getWaitingParticipants,
    findOverlappingMeeting,
    create,
    getById, 
    markTrainerArrival
};
