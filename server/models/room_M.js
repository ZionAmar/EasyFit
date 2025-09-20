const db = require('../config/db_config');

const getAll = (studioId) => {
    const query = 'SELECT id, name FROM rooms WHERE is_available = 1 AND studio_id = ?';
    return db.query(query, [studioId]);
};

const findAvailable = ({ studioId, date, start_time, end_time, excludeMeetingId }) => {
    let query = `
        SELECT id, name
        FROM rooms
        WHERE studio_id = ? AND is_available = 1
        AND id NOT IN (
            SELECT room_id FROM meetings
            WHERE date = ? 
            AND start_time < ? 
            AND end_time > ?
    `;

    if (excludeMeetingId) {
        query += ` AND id != ${db.escape(excludeMeetingId)}`;
    }

    query += `)`; 

    return db.query(query, [studioId, date, end_time, start_time]);
};

module.exports = {
    getAll,
    findAvailable 
};