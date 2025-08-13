const db = require('../config/db_config');

const getAll = (date) => {
    let query = 'SELECT * FROM meetings';
    const params = [];
    
    if (date) {
        query += ' WHERE date = ?';
        params.push(date);
    }

    console.log("Executing SQL Query for Admin:", query, "with params:", params);
    return db.query(query, params);
};

const getByTrainerId = (trainerId, date) => {
    let query = 'SELECT * FROM meetings WHERE trainer_id = ?';
    const params = [trainerId];

    if (date) {
        query += ' AND date = ?';
        params.push(date);
    }
    
    console.log("Executing SQL Query for Trainer:", query, "with params:", params);
    return db.query(query, params);
};

const getByMemberId = (memberId, date) => {
    // >>> שינוי מרכזי כאן <<<
    // השאילתה עכשיו מחזירה גם את הסטטוס מהרישום, ולא מסננת רק רישומים פעילים
    let query = `
        SELECT m.*, mr.status 
        FROM meetings AS m
        JOIN meeting_registrations AS mr ON m.id = mr.meeting_id
        WHERE mr.user_id = ?
    `;
    const params = [memberId];

    if (date) {
        query += ' AND m.date = ?';
        params.push(date);
    }

    console.log("Executing SQL Query for Member:", query, "with params:", params);
    return db.query(query, params);
};

module.exports = {
    getAll,
    getByTrainerId,
    getByMemberId
};