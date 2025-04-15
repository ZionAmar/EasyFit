const db = require("../database");
const middleLog = require("./loginMid");

async function getList(req, res, next) {
    try {
        const [rows] = await db.query("SELECT * FROM users");
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ message: "שגיאה בבסיס הנתונים" });
    }
    next();
}
async function addUser(req, res, next) {
    const { userName, email, name, phone, pass } = req.body;
    const hashedPass = middleLog.EncWithSalt(pass);

    // התפקיד תמיד לקוח
    const is_member = 1;
    const is_trainer = 0;
    const is_admin = 0;

    try {
        const [rows] = await db.query("SELECT * FROM users WHERE userName = ?", [userName]);
        if (rows.length > 0) {
            return res.render("register", { error: "שם משתמש כבר קיים במערכת" });
        }

        const insertQuery = `
            INSERT INTO users (full_name, userName, password_hash, email, phone, is_member, is_trainer, is_admin, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;
        await db.query(insertQuery, [
            name, userName, hashedPass, email, phone,
            is_member, is_trainer, is_admin
        ]);

        return res.redirect("/login");
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "שגיאה בבסיס הנתונים" });
    }
    next();
}

async function updateUser(req, res, next) {
    const { id, name, userName, pass, email, phone } = req.body;
    const hashedPass = middleLog.EncWithSalt(pass);

    const is_member = 1;
    const is_trainer = 0;
    const is_admin = 0;

    try {
        const query = `
            UPDATE users
            SET full_name = ?, userName = ?, password_hash = ?, email = ?, phone = ?,
                is_member = ?, is_trainer = ?, is_admin = ?
            WHERE id = ?
        `;
        await db.query(query, [
            name, userName, hashedPass, email, phone,
            is_member, is_trainer, is_admin,
            id
        ]);
        res.status(200).json({ message: "OK" });
    } catch (err) {
        res.status(500).json({ message: "שגיאה בעדכון" });
    }
    next();
}

async function delUser(req, res, next) {
    const { id } = req.body;

    try {
        await db.query("DELETE FROM users WHERE id = ?", [id]);
        res.status(200).json({ message: "OK" });
    } catch (err) {
        res.status(500).json({ message: "שגיאה במחיקה" });
    }
    next();
}

module.exports = {
    getList,
    addUser,
    updateUser,
    delUser
};
