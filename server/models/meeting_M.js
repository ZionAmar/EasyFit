const db = require('../config/db_config');

const getAll = (date) => {
    let query = 'SELECT * FROM meetings';
    const params = [];
    
    if (date) {
        query += ' WHERE date = ?';
        params.push(date);
    }

    // הוסף את השורה הזו כדי לראות את השאילתה והפרמטרים
    console.log("Executing SQL Query:", query, "with params:", params);

    return db.query(query, params);
};

const getByTrainerId = (trainerId, date) => {
    let query = 'SELECT * FROM meetings WHERE trainer_id = ?';
    const params = [trainerId];

    if (date) {
        query += ' AND date = ?';
        params.push(date);
    }
    
    // הוסף גם כאן את אותה בדיקה
    console.log("Executing SQL Query:", query, "with params:", params);

    return db.query(query, params);
};

const getByMemberId = (memberId, date) => {
    let query = `
        SELECT m.* FROM meetings AS m
        JOIN meeting_registrations AS mr ON m.id = mr.meeting_id
        WHERE mr.user_id = ? AND mr.status = 'active'
    `;
    const params = [memberId];

    if (date) {
        query += ' AND m.date = ?';
        params.push(date);
    }

    // וגם כאן
    console.log("Executing SQL Query:", query, "with params:", params);

    return db.query(query, params);
};

module.exports = {
    getAll,
    getByTrainerId,
    getByMemberId
};