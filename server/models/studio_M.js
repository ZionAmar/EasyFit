const db = require('../config/db_config');

const getStudioByManagerId = async (managerId) => {
    const query = `
        SELECT 
            s.id, s.name, s.address, s.phone_number, s.image_url, s.tagline
        FROM studios s
        JOIN user_roles ur ON s.id = ur.studio_id
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = ? AND r.name = 'admin'
    `;
    const [[studio]] = await db.query(query, [managerId]);
    return studio;
};

const getDashboardStats = async (studioId) => {
    const query = `
        SELECT
            (SELECT COUNT(*) 
             FROM user_roles 
             WHERE studio_id = ? 
               AND role_id = (SELECT id FROM roles WHERE name = 'member')) 
            AS activeMembers,

            (SELECT COUNT(*) 
             FROM meetings 
             WHERE studio_id = ? 
               AND DATE(date) = CURDATE()) 
            AS classesToday,

            (SELECT COUNT(*) 
             FROM users u 
             JOIN user_roles ur ON u.id = ur.user_id 
             WHERE ur.studio_id = ? 
               AND MONTH(u.created_at) = MONTH(CURDATE()) 
               AND YEAR(u.created_at) = YEAR(CURDATE())) 
            AS newMembersThisMonth
    `;
    const [[stats]] = await db.query(query, [studioId, studioId, studioId]);
    return stats;
};

const getTodaysScheduleByStudio = async (studioId) => {
    const query = `
        SELECT 
            m.id,
            m.name,
            m.start_time,
            m.end_time,
            m.participant_count,
            t.full_name AS trainer_name,
            r.name AS room_name,
            r.capacity
        FROM meetings AS m
        JOIN users AS t ON m.trainer_id = t.id
        JOIN rooms AS r ON m.room_id = r.id
        WHERE m.studio_id = ? AND DATE(m.date) = CURDATE()
        ORDER BY m.start_time ASC;
    `;
    const [schedule] = await db.query(query, [studioId]);
    return schedule;
};

const getDetailsById = async (studioId) => {
    const [[details]] = await db.query('SELECT id, name, address, phone_number, image_url, tagline FROM studios WHERE id = ?', [studioId]);
    return details;
};

const getOperatingHours = async (studioId) => {
    const [hours] = await db.query('SELECT day_of_week, open_time, close_time FROM studio_operating_hours WHERE studio_id = ? ORDER BY day_of_week', [studioId]);
    return hours;
};

const updateSettings = async (studioId, details, hours) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        await connection.query(
            'UPDATE studios SET name = ?, address = ?, phone_number = ?, tagline = ? WHERE id = ?',
            [details.name, details.address, details.phone_number, details.tagline, studioId]
        );

        await connection.query('DELETE FROM studio_operating_hours WHERE studio_id = ?', [studioId]);

        if (hours && hours.length > 0) {
            const hoursValues = hours.map(h => [studioId, h.day_of_week, h.open_time, h.close_time]);
            await connection.query(
                'INSERT INTO studio_operating_hours (studio_id, day_of_week, open_time, close_time) VALUES ?',
                [hoursValues]
            );
        }

        await connection.commit();
        return { success: true };
    } catch (err) {
        await connection.rollback();
        console.error("Transaction failed in updateSettings:", err);
        throw err; 
    } finally {
        connection.release();
    }
};

const getByName = async (name) => {
    const [[studio]] = await db.query('SELECT id FROM studios WHERE name = ?', [name]);
    return studio;
};

const createStudioWithNewAdmin = async ({ studio_name, address, phone_number, admin_full_name, email, password_hash, userName }) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [studioResult] = await connection.query(
            'INSERT INTO studios (name, address, phone_number, subscription_status, trial_ends_at) VALUES (?, ?, ?, "trialing", DATE_ADD(NOW(), INTERVAL 14 DAY))',
            [studio_name, address, phone_number]
        );
        const studioId = studioResult.insertId;

        const [userResult] = await connection.query(
            'INSERT INTO users (full_name, email, password_hash, userName) VALUES (?, ?, ?, ?)',
            [admin_full_name, email, password_hash, userName]
        );
        const userId = userResult.insertId;
        
        await connection.query(
            'INSERT INTO user_roles (user_id, studio_id, role_id) VALUES (?, ?, 3)',
            [userId, studioId] 
        );

        await connection.commit();
        return { studioId, userId, studioName: studio_name };
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};

const createStudioWithExistingAdmin = async ({ studio_name, address, phone_number, adminId }) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [studioResult] = await connection.query(
            'INSERT INTO studios (name, address, phone_number, subscription_status, trial_ends_at) VALUES (?, ?, ?, "trialing", DATE_ADD(NOW(), INTERVAL 14 DAY))',
            [studio_name, address, phone_number]
        );
        const studioId = studioResult.insertId;

        await connection.query(
            'INSERT INTO user_roles (user_id, studio_id, role_id) VALUES (?, ?, 3)',
            [adminId, studioId] 
        );

        await connection.commit();
        return { studioId, userId: adminId, studioName: studio_name };
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};

const findAll = async () => {
    const query = `
        SELECT 
            s.*, 
            -- יצירת מערך JSON של אובייקטים (מנהלים), או מערך ריק אם אין
            IFNULL(JSON_ARRAYAGG(
                JSON_OBJECT('id', u.id, 'full_name', u.full_name)
            ), '[]') as admins
        FROM studios s
        LEFT JOIN user_roles ur ON s.id = ur.studio_id AND ur.role_id = 3 -- ID 3 for 'admin'
        LEFT JOIN users u ON ur.user_id = u.id
        GROUP BY s.id
        ORDER BY s.created_at DESC;
    `;
    const [studios] = await db.query(query);
    return studios;
};

const create = async (studioData) => {
    const { name, address, phone_number } = studioData;
    // You can add more fields here as needed
    const [result] = await db.query(
        'INSERT INTO studios (name, address, phone_number) VALUES (?, ?, ?)',
        [name, address, phone_number]
    );
    const [[newStudio]] = await db.query('SELECT * FROM studios WHERE id = ?', [result.insertId]);
    return newStudio;
};

const update = async (id, studioData) => {
    const { name, address, phone_number, subscription_status, trial_ends_at } = studioData;
    await db.query(
        'UPDATE studios SET name = ?, address = ?, phone_number = ?, subscription_status = ?, trial_ends_at = ? WHERE id = ?',
        [name, address, phone_number, subscription_status, trial_ends_at, id]
    );
    const [[updatedStudio]] = await db.query('SELECT * FROM studios WHERE id = ?', [id]);
    return updatedStudio;
};

const remove = async (id) => {
    await db.query('DELETE FROM studios WHERE id = ?', [id]);
    return { message: 'Studio deleted successfully' };
};

const reassignAdmin = async (studioId, newAdminId) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Find the current admin of the studio
        const [currentAdmins] = await connection.query(
            `SELECT user_id FROM user_roles WHERE studio_id = ? AND role_id = 3`, // Assuming 3 is admin
            [studioId]
        );

        // 2. Remove the 'admin' role from all current admins for this studio
        if (currentAdmins.length > 0) {
            const currentAdminIds = currentAdmins.map(a => a.user_id);
            await connection.query(
                `DELETE FROM user_roles WHERE studio_id = ? AND role_id = 3 AND user_id IN (?)`,
                [studioId, currentAdminIds]
            );
        }
        
        // 3. Assign the 'admin' role to the new user for this studio
        // This query will add the admin role. If the user already has another role (like trainer),
        // it will now have both. If they have no role, it will be their first.
        // We use INSERT IGNORE to prevent errors if the user is already an admin (edge case).
        await connection.query(
            `INSERT IGNORE INTO user_roles (user_id, studio_id, role_id) VALUES (?, ?, 3)`,
            [newAdminId, studioId]
        );

        await connection.commit();
        return { success: true, message: 'Admin reassigned successfully.' };
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};

module.exports = {
    getStudioByManagerId,
    getDashboardStats,
    getTodaysScheduleByStudio, 
    getDetailsById,
    getOperatingHours,
    updateSettings,
    getByName,
    createStudioWithNewAdmin,
    findAll,
    create,
    update,
    remove,
    reassignAdmin,
    createStudioWithExistingAdmin
};