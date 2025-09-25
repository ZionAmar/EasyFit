const db = require('../config/db_config');

const getAll = (studioId) => {
    const query = 'SELECT * FROM rooms WHERE studio_id = ? ORDER BY name ASC';
    return db.query(query, [studioId]);
};

const findAvailable = ({ studioId, date, start_time, end_time, excludeMeetingId }) => {
    let query = `
        SELECT id, name, capacity, has_equipment
        FROM rooms
        WHERE studio_id = ? AND is_available = 1
        AND id NOT IN (
            SELECT room_id FROM meetings
            WHERE date = ? 
            AND start_time < ? 
            AND end_time > ?
    `;

    if (excludeMeetingId) {
        query += ` AND id != ?`; 
    }

    query += `)`; 
    
    const params = [studioId, date, end_time, start_time];
    if (excludeMeetingId) {
        params.push(excludeMeetingId);
    }

    return db.query(query, params);
};

const getById = async (roomId, studioId) => {
    const [[room]] = await db.query('SELECT * FROM rooms WHERE id = ? AND studio_id = ?', [roomId, studioId]);
    return room;
};

const create = (roomData) => {
    const { studio_id, name, capacity, is_available, has_equipment } = roomData;
    const query = 'INSERT INTO rooms (studio_id, name, capacity, is_available, has_equipment) VALUES (?, ?, ?, ?, ?)';
    return db.query(query, [studio_id, name, capacity, is_available, has_equipment]);
};

const update = (roomId, roomData) => {
    const { name, capacity, is_available, has_equipment } = roomData;
    const query = 'UPDATE rooms SET name = ?, capacity = ?, is_available = ?, has_equipment = ? WHERE id = ?';
    return db.query(query, [name, capacity, is_available, has_equipment, roomId]);
};

const remove = (roomId) => {
    const query = 'DELETE FROM rooms WHERE id = ? AND NOT EXISTS (SELECT 1 FROM meetings WHERE room_id = ? AND date >= CURDATE())';
    return db.query(query, [roomId, roomId]);
};

module.exports = {
    getAll,
    findAvailable,
    getById,
    create,
    update,
    remove,
};