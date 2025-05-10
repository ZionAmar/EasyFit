const express = require('express');
const router = express.Router();
const middleReg = require("../middleware/registerMid");

// טופס הרשמה
router.get("/", (req, res) => {
    res.render("register", {
        title: "הרשמה",
        header: "הרשמה"
    });
});

// שליחת טופס הרשמה
router.post("/add", middleReg.addUser);

module.exports = router;
