// קובץ: server/models/room_M.js (מעודכן)
const db = require('../config/db_config');

const getAll = (studioId) => {
    const query = 'SELECT id, name FROM rooms WHERE is_available = 1 AND studio_id = ?';
    return db.query(query, [studioId]);
};

// --- פונקציה חדשה ---
const findAvailable = ({ studioId, date, start_time, end_time, excludeMeetingId }) => {
    // השאילתה מוצאת את כל החדרים בסטודיו
    // שאינם משובצים לשיעור אחר שמתנגש עם טווח הזמן המבוקש.
    let query = `
        SELECT id, name
        FROM rooms
        WHERE studio_id = ? AND is_available = 1
        AND id NOT IN (
            SELECT room_id FROM meetings
            WHERE date = ? 
            AND start_time < ? 
            AND end_time > ?
    `;

    // במצב עריכה, אנחנו רוצים להתעלם מהשיעור הנוכחי בבדיקת ההתנגשות
    if (excludeMeetingId) {
        query += ` AND id != ${db.escape(excludeMeetingId)}`;
    }

    query += `)`; // סגירת תת-השאילתה

    return db.query(query, [studioId, date, end_time, start_time]);
};

module.exports = {
    getAll,
    findAvailable // <-- הוספה לייצוא
};