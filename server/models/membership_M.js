const db = require('../config/db_config'); 

const create = ({ user_id, studio_id, studio_product_id, start_date, expiry_date, visits_remaining, status }) => {
    const query = `
        INSERT INTO user_memberships 
        (user_id, studio_id, studio_product_id, start_date, expiry_date, visits_remaining, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    return db.query(query, [user_id, studio_id, studio_product_id, start_date, expiry_date, visits_remaining, status]);
};

const getByUserId = (user_id) => {
    const query = `
        SELECT 
            um.*, 
            sp.name as product_name, 
            sp.visit_limit as total_visits
        FROM user_memberships um
        LEFT JOIN studio_products sp ON um.studio_product_id = sp.id
        WHERE um.user_id = ?
        ORDER BY um.start_date DESC
    `;
    return db.query(query, [user_id]);
};

const getById = (id) => {
    const query = `SELECT * FROM user_memberships WHERE id = ?`;
    return db.query(query, [id]);
};

const update = (id, { start_date, expiry_date, visits_remaining, status }) => {
    const query = `
        UPDATE user_memberships SET 
        start_date = ?, expiry_date = ?, visits_remaining = ?, status = ?
        WHERE id = ?
    `;
    return db.query(query, [start_date, expiry_date, visits_remaining, status, id]);
};

const remove = (id) => {
    const query = `DELETE FROM user_memberships WHERE id = ?`;
    return db.query(query, [id]);
};

const decrementVisit = (id) => {
    const query = `
        UPDATE user_memberships 
        SET visits_remaining = visits_remaining - 1
        WHERE id = ? AND visits_remaining > 0
    `;
    return db.query(query, [id]);
};


module.exports = {
    create,
    getByUserId,
    getById,
    update,
    remove,
    decrementVisit
};