const db = require('../config/db_config');

const findExisting = (userId, meetingId) => {
    const query = `
        SELECT id FROM meeting_registrations
        WHERE user_id = ? AND meeting_id = ? AND status IN ('active', 'waiting', 'pending')
    `;
    return db.query(query, [userId, meetingId]);
};

const add = (userId, meetingId, status) => {
    const query = `
        INSERT INTO meeting_registrations (user_id, meeting_id, status)
        VALUES (?, ?, ?)
    `;
    return db.query(query, [userId, meetingId, status]);
};

const updateRegistrationStatus = (registrationId, status) => {
    const query = 'UPDATE meeting_registrations SET status = ? WHERE id = ?';
    return db.query(query, [status, registrationId]);
};

const setCheckInTime = (registrationId) => {
    const query = 'UPDATE meeting_registrations SET status = \'checked_in\', check_in_time = NOW() WHERE id = ?';
    return db.query(query, [registrationId]);
};


const getRegistrationById = (registrationId) => {
    return db.query('SELECT * FROM meeting_registrations WHERE id = ?', [registrationId]);
};

const getNextInWaitingList = (meetingId) => {
    const query = `
        SELECT 
            mr.id as registration_id,
            u.id as user_id,
            u.full_name,
            u.phone
        FROM meeting_registrations mr
        JOIN users u ON mr.user_id = u.id
        WHERE mr.meeting_id = ? AND mr.status = 'waiting'
        ORDER BY mr.registered_at ASC
        LIMIT 1
    `;
    return db.query(query, [meetingId]);
};

module.exports = {
    findExisting,
    add,
    updateRegistrationStatus,
    setCheckInTime, 
    getRegistrationById,
    getNextInWaitingList
};