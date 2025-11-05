const db = require('../config/db_config');

const findAllWithRoles = async () => {
    const query = `
        SELECT 
            u.id, u.full_name, u.email, u.userName, u.status,
            CONCAT('[', IFNULL(GROUP_CONCAT(DISTINCT JSON_OBJECT('studio_id', s.id, 'studio_name', s.name, 'role_name', r.name)), ''), ']') as roles
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.id
        LEFT JOIN studios s ON ur.studio_id = s.id
        GROUP BY u.id
        ORDER BY u.created_at DESC;
    `;
    const [users] = await db.query(query);
    return users;
};

const addRole = async ({ userId, studioId, roleName }) => {
    const query = `
        INSERT INTO user_roles (user_id, studio_id, role_id) 
        SELECT ?, ?, (SELECT id FROM roles WHERE name = ?)
        ON DUPLICATE KEY UPDATE user_id=user_id;
    `;
    await db.query(query, [userId, studioId, roleName]);
    return { success: true };
};

const removeRole = async ({ userId, studioId, roleName }) => {
    const query = `
        DELETE FROM user_roles 
        WHERE user_id = ? AND studio_id = ? AND role_id = (SELECT id FROM roles WHERE name = ?);
    `;
    
    const [result] = await db.query(query, [userId, studioId, roleName]);

    console.log('Database delete result:', result);

    if (result.affectedRows === 0) {
        throw new Error(`Role '${roleName}' for user '${userId}' in studio '${studioId}' not found. Nothing deleted.`);
    }

    return { success: true };
};

const getAll = ({ role, studioId }) => {
    let query = `
        SELECT 
            u.id, u.full_name, u.email, u.userName, u.phone, u.profile_picture_url,
            IFNULL(
                CONCAT('[', 
                    GROUP_CONCAT(
                        DISTINCT JSON_OBJECT('studio_id', s.id, 'studio_name', s.name, 'role', r.name)
                    SEPARATOR ','), 
                ']'), 
            '[]') as roles
        FROM users u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        JOIN studios s ON ur.studio_id = s.id
    `;
    const params = [];
    const whereClauses = [];

    if (studioId) {
        whereClauses.push(`ur.studio_id = ?`);
        params.push(studioId);
    }
    
    if (role) {
        whereClauses.push(`u.id IN (
            SELECT DISTINCT user_id 
            FROM user_roles ur_sub
            JOIN roles r_sub ON ur_sub.role_id = r_sub.id
            WHERE ur_sub.studio_id = ? AND r_sub.name = ?
        )`);
        params.push(studioId, role); 
    }

    if (whereClauses.length > 0) {
        query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    query += ' GROUP BY u.id';
    return db.query(query, params);
};

const getById = (id) => {
    const query = `SELECT * FROM users WHERE id = ?`;
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
        SELECT s.id as studio_id, s.name as studio_name, r.name as role_name
        FROM user_roles ur
        JOIN studios s ON ur.studio_id = s.id
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = ?
    `;
    return db.query(query, [userId]);
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

const update = async (id, data) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const userFields = ['full_name', 'email', 'phone', 'status'];
        const fieldsToUpdate = [];
        const values = [];
        
        userFields.forEach(field => {
            if (data[field] !== undefined) {
                fieldsToUpdate.push(`${field} = ?`);
                values.push(data[field]);
            }
        });

        if (fieldsToUpdate.length > 0) {
            values.push(id);
            const userQuery = `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
            await connection.query(userQuery, values);
        }

        if (data.roles && data.studioId) {
            const { roles, studioId } = data;
            const deleteQuery = 'DELETE FROM user_roles WHERE user_id = ? AND studio_id = ?';
            await connection.query(deleteQuery, [id, studioId]);

            if (roles.length > 0) {
                const rolesQuery = 'INSERT INTO user_roles (user_id, studio_id, role_id) SELECT ?, ?, r.id FROM roles r WHERE r.name IN (?)';
                await connection.query(rolesQuery, [id, studioId, roles]);
            }
        }

        await connection.commit();
        const [[updatedUser]] = await getById(id);
        return updatedUser;
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

const removeUserFromStudio = (userId, studioId) => {
    return db.query('DELETE FROM user_roles WHERE user_id = ? AND studio_id = ?', [userId, studioId]);
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
            WHERE date = ? AND start_time < ? AND end_time > ?
    `;
    const params = [studioId, date, end_time, start_time];
    if (excludeMeetingId) {
        query += ` AND id != ?`;
        params.push(excludeMeetingId);
    }
    query += `)`;
    return db.query(query, params);
};

const updateProfile = (id, data) => {
    const fieldsToUpdate = [];
    const values = [];
    ['full_name', 'phone', 'profile_picture_url'].forEach(field => {
        if (data[field] !== undefined) {
            fieldsToUpdate.push(`${field} = ?`);
            values.push(data[field]);
        }
    });
    if (fieldsToUpdate.length === 0) return Promise.resolve();
    const query = `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
    values.push(id);
    return db.query(query, values);
};

module.exports = {
    findAllWithRoles,
    addRole,
    removeRole,
    getAll,
    getById,
    getByUserName,
    getByEmail,
    findStudiosAndRolesByUserId,
    create,
    update,
    remove,
    removeUserFromStudio,
    findAvailableTrainers,
    updateProfile
};