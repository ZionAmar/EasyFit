const db = require('../config/db_config');

const getByTrainerId = (trainerId, date) => {
    // >>> הוספנו JOIN ל-rooms ו-r.name as roomName <<<
    let query = `
        SELECT 
            m.id, m.name, m.trainer_id, m.room_id, m.participant_count,
            CONCAT(m.date, 'T', m.start_time) as start,
            CONCAT(m.date, 'T', m.end_time) as end,
            u.full_name as trainerName,
            r.name as roomName,
            r.capacity 
        FROM meetings m
        JOIN users u ON m.trainer_id = u.id
        JOIN rooms r ON m.room_id = r.id
        WHERE m.trainer_id = ?
    `;
    const params = [trainerId];
    if (date) {
        query += ' AND m.date = ?';
        params.push(date);
    }
    return db.query(query, params);
};

const getByMemberId = (memberId, date) => {
    // >>> הוספנו JOIN ל-rooms ו-r.name as roomName <<<
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
        WHERE mr.user_id = ?
    `;
    const params = [memberId];
    if (date) {
        query += ' AND m.date = ?';
        params.push(date);
    }
    return db.query(query, params);
};

const getPublicSchedule = (date) => {
    // >>> הוספנו JOIN ל-rooms ו-r.name as roomName <<<
    let query = `
        SELECT 
            m.id, m.name, m.trainer_id, m.room_id, m.participant_count,
            CONCAT(m.date, 'T', m.start_time) as start,
            CONCAT(m.date, 'T', m.end_time) as end,
            u.full_name as trainerName,
            r.name as roomName
        FROM meetings m
        JOIN users u ON m.trainer_id = u.id 
        JOIN rooms r ON m.room_id = r.id
        WHERE m.date >= CURDATE()
    `;
    const params = [];
    if (date) {
        query = `
            SELECT 
                m.id, m.name, m.trainer_id, m.room_id, m.participant_count,
                CONCAT(m.date, 'T', m.start_time) as start,
                CONCAT(m.date, 'T', m.end_time) as end,
                u.full_name as trainerName 
            FROM meetings m
            JOIN users u ON m.trainer_id = u.id 
            WHERE m.date = ?
        `;
        params.push(date);
    }
    return db.query(query, params);
};

// >>> הוספנו את הפונקציה הזו בחזרה <<<
const getById = (id) => {
    const query = `
        SELECT m.*, r.capacity 
        FROM meetings m
        JOIN rooms r ON m.room_id = r.id
        WHERE m.id = ?
    `;
    return db.query(query, [id]);
};

const findOverlappingMeeting = ({ date, start_time, end_time, room_id }) => {
    const query = `
        SELECT id FROM meetings
        WHERE room_id = ? AND date = ? AND start_time < ? AND end_time > ?
    `;
    return db.query(query, [room_id, date, end_time, start_time]);
};

const create = ({ name, trainer_id, date, start_time, end_time, room_id }) => {
    const query = `
        INSERT INTO meetings (name, trainer_id, date, start_time, end_time, room_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    return db.query(query, [name, trainer_id, date, start_time, end_time, room_id]);
};

const getActiveParticipants = (meetingId) => {
    const query = `SELECT u.id, u.full_name, mr.status, mr.id as registrationId FROM users u JOIN meeting_registrations mr ON u.id = mr.user_id WHERE mr.meeting_id = ? AND mr.status IN ('active', 'checked_in')`;
    return db.query(query, [meetingId]);
};

const getWaitingParticipants = (meetingId) => {
    const query = `SELECT u.id, u.full_name, mr.status, mr.id as registrationId FROM users u JOIN meeting_registrations mr ON u.id = mr.user_id WHERE mr.meeting_id = ? AND mr.status = 'waiting'`;
    return db.query(query, [meetingId]);
};

const updateRegistrationStatus = (registrationId, status) => {
    const query = `UPDATE meeting_registrations SET status = ? WHERE id = ?`;
    return db.query(query, [status, registrationId]);
};

const syncParticipantCount = async (meetingId) => {
    const countQuery = `SELECT COUNT(*) as activeCount FROM meeting_registrations WHERE meeting_id = ? AND status = 'active'`;
    const [[{ activeCount }]] = await db.query(countQuery, [meetingId]);
    const updateQuery = `UPDATE meetings SET participant_count = ? WHERE id = ?`;
    await db.query(updateQuery, [activeCount, meetingId]);
    return activeCount;
};


module.exports = {
    getByTrainerId,
    getByMemberId,
    getPublicSchedule,
    getActiveParticipants,
    getWaitingParticipants,
    updateRegistrationStatus,
    findOverlappingMeeting,
    create,
    getById, 
    syncParticipantCount
};