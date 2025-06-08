require('dotenv').config(); // טוען את קובץ .env
const mysql = require('mysql2');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.HOST,
    user: process.env.USER_DB,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
});

module.exports = pool.promise();