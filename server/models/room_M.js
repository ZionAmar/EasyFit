const db = require('../config/db_config');

const getAll = () => {
    const query = 'SELECT id, name FROM rooms WHERE is_available = 1';
    return db.query(query);
};

module.exports = {
    getAll
};