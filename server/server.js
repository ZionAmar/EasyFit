// >> קובץ: server.js
// >> תיקון: הוספת הקידומת /api לכל הראוטים של השרת.

const express = require("express");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const path = require("path");
const errorHandler = require("./middlewares/errorHandler");
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4060;

// Middlewares כלליים
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// הגדרת CORS
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

// FIX: הוספת הקידומת /api לכל הראוטים כדי למנוע התנגשות
app.use("/api", require("./routes/index"));

// קבצים סטטיים ל־React - מוגש רק אם אף נתיב API לא תאם
app.use(express.static(path.join(__dirname, "../client/build")));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});


// Middleware גלובלי לטיפול בשגיאות
app.use(errorHandler);

// הרצת השרת
app.listen(PORT, () => {
  console.log(`✅ EasyFit server is running at http://localhost:${PORT}`);
});