const express = require('express');
const router = express.Router();
const middleLog = require("../middleware/loginMid");

module.exports = router;

// טופס התחברות
router.get("/", (req, res) => {
    res.render("login", { title: "login page", header: "login page" });
});

// בדיקת התחברות
router.post("/check", [middleLog.check_login], (req, res) => {
    if (res.loggedEn) {
        res.redirect("/"); // הנתיב שאליו אתה רוצה להעביר
    } else {
        res.render("login", { error: "שם משתמש או סיסמה שגויים", title: "login page", header: "login page" });
    }
});
