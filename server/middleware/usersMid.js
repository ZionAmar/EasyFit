const db = require('../database'); // ייבוא חיבור למסד הנתונים

// Middleware לשליפת כל המשתמשים
async function getUsers(req, res, next) {
    try {
        const [rows] = await db.query('SELECT * FROM users'); // שאילתת SELECT
        req.users = rows; // שמירת המידע ב-req
        next();
    } catch (err) {
        req.error = { status: 500, message: 'Error fetching users' };
        next(err); // העברת השגיאה הלאה
    }
}

// Middleware ליצירת משתמש חדש
async function createUser(req, res, next) {
    const { name, email } = req.body;

    if (!name || !email) {
        req.error = { status: 400, message: 'Missing name or email' };
        return next();
    }

    try {
        const [result] = await db.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
        req.newUser = { id: result.insertId, name, email }; // משתמש חדש עם ID שנוצר
        next();
    } catch (err) {
        req.error = { status: 500, message: 'Error creating user' };
        next(err);
    }
}

// Middleware לעדכון משתמש קיים
async function updateUser(req, res, next) {
    const { id, name, email } = req.body;

    if (!id) {
        req.error = { status: 400, message: 'Missing id' };
        return next();
    }

    try {
        const [result] = await db.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id]);

        if (result.affectedRows === 0) {
            req.error = { status: 404, message: 'User not found' };
            return next();
        }

        req.updatedUser = { id, name, email }; // מידע המשתמש המעודכן
        next();
    } catch (err) {
        req.error = { status: 500, message: 'Error updating user' };
        next(err);
    }
}

// Middleware למחיקת משתמש
async function deleteUser(req, res, next) {
    const { id } = req.body;

    if (!id) {
        req.error = { status: 400, message: 'Missing id' };
        return next();
    }

    try {
        const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            req.error = { status: 404, message: 'User not found' };
            return next();
        }

        req.deletedMessage = { message: 'User deleted successfully' };
        next();
    } catch (err) {
        req.error = { status: 500, message: 'Error deleting user' };
        next(err);
    }
}

module.exports = { getUsers, createUser, updateUser, deleteUser };
