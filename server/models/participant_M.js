const db = require('../config/db_config');

const findExisting = (userId, meetingId) => {
    const query = `
        SELECT id FROM meeting_registrations
        WHERE user_id = ? AND meeting_id = ? AND status IN ('active', 'waiting')
    `;
    return db.query(query, [userId, meetingId]);
};

const add = (userId, meetingId, status) => {
    const query = `
        INSERT INTO meeting_registrations (user_id, meeting_id, status)
        VALUES (?, ?, ?)
    `;
    return db.query(query, [userId, meetingId, status]);
};

// החלף את פונקציית updateStatus בזו:
const updateStatus = (participantId, status) => {
    // בגישה החדשה, אנחנו מתעלמים מהסטטוס שנשלח מהלקוח
    // ומעדכנים רק את שדה הזמן עבור הרישום הספציפי.
    const query = `
        UPDATE meeting_registrations 
        SET check_in_time = NOW() 
        WHERE id = ? AND check_in_time IS NULL
    `;
    // אנחנו שולחים רק את מזהה הרישום
    return db.query(query, [participantId]);
};

const getRegistrationById = (registrationId) => {
    return db.query('SELECT * FROM meeting_registrations WHERE id = ?', [registrationId]);
};

module.exports = {
    findExisting,
    add,
    updateStatus,
    getRegistrationById
};