const db = require('../config/db_config'); 

const create = ({ studio_id, name, description, price, visit_limit, duration_days }) => {
    const query = `
        INSERT INTO studio_products 
        (studio_id, name, description, price, visit_limit, duration_days) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    return db.query(query, [studio_id, name, description, price, visit_limit, duration_days]);
};

const getByStudioId = (studio_id) => {
    const query = `SELECT * FROM studio_products WHERE studio_id = ? ORDER BY created_at DESC`;
    return db.query(query, [studio_id]);
};

const getById = (id) => {
    const query = `SELECT * FROM studio_products WHERE id = ?`;
    return db.query(query, [id]);
};

const update = (id, { name, description, price, visit_limit, duration_days, is_active }) => {
    const query = `
        UPDATE studio_products SET 
        name = ?, description = ?, price = ?, visit_limit = ?, duration_days = ?, is_active = ?
        WHERE id = ?
    `;
    return db.query(query, [name, description, price, visit_limit, duration_days, is_active, id]);
};

const setActiveStatus = (id, is_active) => {
    const query = `UPDATE studio_products SET is_active = ? WHERE id = ?`;
    return db.query(query, [is_active, id]);
};


module.exports = {
    create,
    getByStudioId,
    getById,
    update,
    setActiveStatus
};