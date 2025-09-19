const db = require('../config/db_config');

const getAll = ({ role, studioId }) => {
    let query = `
        SELECT 
            u.id, u.full_name, u.email, u.userName, u.phone,
            CONCAT('[', GROUP_CONCAT(DISTINCT JSON_OBJECT('studio_id', s.id, 'studio_name', s.name, 'role', r.name)), ']') as roles
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.id
        LEFT JOIN studios s ON ur.studio_id = s.id
    `;
    const params = [];

    const whereClauses = [];
    if (studioId) {
        whereClauses.push(`u.id IN (SELECT user_id FROM user_roles WHERE studio_id = ?)`);
        params.push(studioId);
    }
    if (role) {
        whereClauses.push(`u.id IN (SELECT user_id FROM user_roles ur_filter JOIN roles r_filter ON ur_filter.role_id = r_filter.id WHERE ur_filter.studio_id = ? AND r_filter.name = ?)`);
        params.push(studioId, role);
    }

    if (whereClauses.length > 0) {
        query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    query += ' GROUP BY u.id';
    
    return db.query(query, params);
};

const getById = (id) => {
    const query = `
        SELECT 
            u.id, u.full_name, u.email, u.userName, u.phone,
            CONCAT('[', GROUP_CONCAT(DISTINCT JSON_OBJECT('studio_id', s.id, 'studio_name', s.name, 'role', r.name)), ']') as roles
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.id
        LEFT JOIN studios s ON ur.studio_id = s.id
        WHERE u.id = ?
        GROUP BY u.id
    `;
    return db.query(query, [id]);
};

const getByUserName = (userName) => {
    const query = `SELECT * FROM users WHERE userName = ?`;
    return db.query(query, [userName]).then(([rows]) => rows[0] || null);
};

const getByEmail = (email) => {
    const query = `SELECT * FROM users WHERE email = ?`;
    return db.query(query, [email]).then(([rows]) => rows[0] || null);
};


const findStudiosAndRolesByUserId = (userId) => {
    const query = `
        SELECT 
            s.id as studio_id,
            s.name as studio_name,
            r.name as role_name
        FROM user_roles ur
        JOIN studios s ON ur.studio_id = s.id
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = ?
    `;
    return db.query(query, [userId]);
};

const findRolesByStudio = (userId, studioId) => {
    const query = `
        SELECT r.name 
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = ? AND ur.studio_id = ?
    `;
    return db.query(query, [userId, studioId]);
};

const create = async ({ full_name, email, userName, password_hash, phone, roles, studioId }) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const userQuery = 'INSERT INTO users (full_name, email, userName, password_hash, phone) VALUES (?, ?, ?, ?, ?)';
        const [userResult] = await connection.query(userQuery, [full_name, email, userName, password_hash, phone]);
        const userId = userResult.insertId;

        if (roles && roles.length > 0 && studioId) {
            const rolesQuery = 'INSERT INTO user_roles (user_id, studio_id, role_id) SELECT ?, ?, r.id FROM roles r WHERE r.name IN (?)';
            await connection.query(rolesQuery, [userId, studioId, roles]);
        }
        
        await connection.commit();
        return { id: userId, full_name, email, roles, studioId };
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};

const update = async (id, { full_name, email, phone, roles, studioId }) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const userQuery = 'UPDATE users SET full_name = ?, email = ?, phone = ? WHERE id = ?';
        await connection.query(userQuery, [full_name, email, phone, id]);

        if (roles && studioId) {
            const deleteQuery = 'DELETE FROM user_roles WHERE user_id = ? AND studio_id = ?';
            await connection.query(deleteQuery, [id, studioId]);

            if (roles.length > 0) {
                const rolesQuery = 'INSERT INTO user_roles (user_id, studio_id, role_id) SELECT ?, ?, r.id FROM roles r WHERE r.name IN (?)';
                await connection.query(rolesQuery, [id, studioId, roles]);
            }
        }

        await connection.commit();
        return { id, full_name, email };
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};

const remove = (id) => {
    return db.query('DELETE FROM users WHERE id = ?', [id]);
};

const findAvailableTrainers = ({ studioId, date, start_time, end_time, excludeMeetingId }) => {
    let query = `
        SELECT u.id, u.full_name
        FROM users u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.studio_id = ? AND r.name = 'trainer'
        AND u.id NOT IN (
            SELECT trainer_id FROM meetings
            WHERE date = ? 
            AND start_time < ? 
            AND end_time > ?
    `;
    const params = [studioId, date, end_time, start_time];

    if (excludeMeetingId) {
        query += ` AND id != ?`;
        params.push(excludeMeetingId);
    }

    query += `)`;
    
    return db.query(query, params);
};

module.exports = {
    getAll,
    getById,
    getByUserName,
    getByEmail,
    findStudiosAndRolesByUserId,
    findRolesByStudio,
    create,
    update,
    remove,
    findAvailableTrainers 
};