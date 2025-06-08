const db = require("../database");
const middleLog = require("./loginMid");

async function addUser(req, res) {
    const { userName, email, name, phone, pass } = req.body;
    const hashedPass = middleLog.EncWithSalt(pass);

    const is_member = 1;
    const is_trainer = 0;
    const is_admin = 0;

    try {
        const [rows] = await db.query("SELECT * FROM users WHERE userName = ?", [userName]);
        if (rows.length > 0) {
            return res.render("register", {
                title: "הרשמה",
                header: "הרשמה",
                error: "שם המשתמש כבר קיים במערכת"
            });
        }

        await db.query(`
            INSERT INTO users (full_name, userName, password_hash, email, phone, is_member, is_trainer, is_admin, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [name, userName, hashedPass, email, phone, is_member, is_trainer, is_admin]);

        return res.redirect("/login");
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "שגיאה בבסיס הנתונים" });
    }
}

module.exports = { addUser };
