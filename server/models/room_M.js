const db = require('../config/db_config');

const getAll = (studioId) => {
    const query = 'SELECT id, name FROM rooms WHERE is_available = 1 AND studio_id = ?';
    return db.query(query, [studioId]);
};

module.exports = {
    getAll
};