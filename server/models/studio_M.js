// קובץ: server/models/studio_M.js
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

// --- פונקציה חדשה ---
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

module.exports = {
    getStudioByManagerId,
    getDashboardStats,
    getTodaysScheduleByStudio // <- הוספה לייצוא
};