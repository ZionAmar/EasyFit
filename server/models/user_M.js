// קובץ: models/user_M.js

const db = require('../config/db_config');

const getAll = () => {
    const query = `
        SELECT 
            u.id, u.full_name, u.email, u.userName, u.phone,
            GROUP_CONCAT(DISTINCT JSON_OBJECT('studio_id', s.id, 'studio_name', s.name, 'role', r.name)) as roles
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.id
        LEFT JOIN studios s ON ur.studio_id = s.id
        GROUP BY u.id
    `;
    return db.query(query);
};

const getById = (id) => {
    const query = `
        SELECT 
            u.id, u.full_name, u.email, u.userName, u.phone,
            GROUP_CONCAT(DISTINCT JSON_OBJECT('studio_id', s.id, 'studio_name', s.name, 'role', r.name)) as roles
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
            await connection.query(rolesQuery, [userId, studioId, [roles]]);
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
                await connection.query(rolesQuery, [id, studioId, [roles]]);
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

module.exports = {
    getAll,
    getById,
    getByUserName,
    findStudiosAndRolesByUserId,
    findRolesByStudio,
    create,
    update,
    remove,
};