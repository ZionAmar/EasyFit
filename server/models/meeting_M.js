const db = require('../config/db_config');

const getByTrainerId = (trainerId, date) => {
    let query = `
        SELECT id, name, trainer_id, room_id, participant_count,
               CONCAT(date, 'T', start_time) as start,
               CONCAT(date, 'T', end_time) as end
        FROM meetings WHERE trainer_id = ?
    `;
    const params = [trainerId];
    if (date) {
        query += ' AND date = ?';
        params.push(date);
    }
    return db.query(query, params);
};

const getByMemberId = (memberId, date) => {
    let query = `
        SELECT m.id, m.name, m.trainer_id, m.room_id, m.participant_count,
               CONCAT(m.date, 'T', m.start_time) as start,
               CONCAT(m.date, 'T', m.end_time) as end,
               mr.status 
        FROM meetings AS m
        JOIN meeting_registrations AS mr ON m.id = mr.meeting_id
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
    let query = `
        SELECT id, name, trainer_id, room_id, participant_count,
               CONCAT(date, 'T', start_time) as start,
               CONCAT(date, 'T', end_time) as end
        FROM meetings WHERE date >= CURDATE()
    `;
    const params = [];
    if (date) {
        // אם מבקשים תאריך ספציפי, נחפש רק אותו
        query = `
            SELECT id, name, trainer_id, room_id, participant_count,
                   CONCAT(date, 'T', start_time) as start,
                   CONCAT(date, 'T', end_time) as end
            FROM meetings WHERE date = ?
        `;
        params.push(date);
    }
    return db.query(query, params);
};

const findOverlappingMeeting = ({ date, start_time, end_time, room_id }) => {
    const query = `
        SELECT id FROM meetings
        WHERE room_id = ?
        AND date = ?
        AND start_time < ?  -- שעת ההתחלה של החדש קטנה משעת הסיום של הקיים
        AND end_time > ?    -- שעת הסיום של החדש גדולה משעת ההתחלה של הקיים
    `;
    // אנחנו בודקים אם יש מפגש קיים שהזמן שלו מתנגש עם הזמן החדש
    return db.query(query, [room_id, date, end_time, start_time]);
};

// >>> הוספה: פונקציה ליצירת מפגש חדש <<<
const create = ({ name, trainer_id, date, start_time, end_time, room_id }) => {
    const query = `
        INSERT INTO meetings (name, trainer_id, date, start_time, end_time, room_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    return db.query(query, [name, trainer_id, date, start_time, end_time, room_id]);
};

// הפונקציות הבאות נשארות כפי שהן
const getActiveParticipants = (meetingId) => {
    const query = `SELECT u.id, u.full_name, mr.status, mr.id as registrationId FROM users u JOIN meeting_registrations mr ON u.id = mr.user_id WHERE mr.meeting_id = ? AND mr.status IN ('active', 'checked_in')`;
    return db.query(query, [meetingId]);
};

const getWaitingParticipants = (meetingId) => {
    const query = `SELECT u.id, u.full_name FROM users u JOIN meeting_registrations mr ON u.id = mr.user_id WHERE mr.meeting_id = ? AND mr.status = 'waiting'`;
    return db.query(query, [meetingId]);
};

const updateRegistrationStatus = (registrationId, status) => {
    const query = `UPDATE meeting_registrations SET status = ? WHERE id = ?`;
    return db.query(query, [status, registrationId]);
};

module.exports = {
    getByTrainerId,
    getByMemberId,
    getPublicSchedule,
    getActiveParticipants,
    getWaitingParticipants,
    updateRegistrationStatus,
    findOverlappingMeeting,
    create
};