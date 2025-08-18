const express = require("express");
const router = express.Router();
const path = require("path");

// Middlewares
const authMidd = require("../middlewares/auth_Midd");
const { json } = require("body-parser");
const { Message } = require("twilio/lib/twiml/MessagingResponse");

// ראוטים שדורשים התחברות
// router.use("/meetings", loginMid.isLogged, require("./meetings"));
// router.use("/rooms", loginMid.isLogged, require("./rooms"));
// router.use("/participation", loginMid.isLogged, require("./participation"));
// router.use("/calendar", loginMid.isLogged, require("./calendar"));
router.use("/users", authMidd.isLoggedIn, require("./users_R"));
router.use("/auth", require("./auth_R"));
router.use("/rooms", require("./room_R"));
router.use('/meetings', require('./meetings_R')); // שינוי שם ל-meetings
// router.use("/", (req,res)=>{res.json({message:"server is working"})});
// ראוטים פתוחים
// router.use("/register", require("./register"));
// router.use("/login", require("./login"));


module.exports = router;
