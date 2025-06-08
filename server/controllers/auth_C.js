// >> קובץ: controllers/auth_C.js
// >> תיקון: הוספת controller.verify והפרדת אחריות בלוגיקה של ה-login.

const authService = require('../services/auth_S');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.jwtSecret;

const login = async (req, res, next) => {
  try {
    // FIX: Service מחזיר רק את המשתמש, ה-Controller אחראי על ה-cookie והתשובה
    const user = await authService.login(req.body); 
    
    // יצירת הטוקן וקביעת ה-cookie ב-Controller
    const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '3h' });
    res.cookie("jwt", token, { httpOnly: true, maxAge: 3 * 60 * 60 * 1000 });

    // שליחת אובייקט המשתמש המלא ללקוח
    res.json(user);
  } catch (err) {
    next(err);
  }
};

const register = async (req, res, next) => {
  try {
    const data = await authService.register(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const logout = (req, res) => {
  res.clearCookie("jwt");
  res.status(200).json({ message: "Logged out" });
};

// ADDED: פונקציה שמחזירה את פרטי המשתמש אם הטוקן תקין
const verify = (req, res) => {
    // req.user מגיע מה-middleware isLoggedIn
    res.json(req.user);
};

module.exports = {
  login,
  register,
  logout,
  verify, // ייצוא הפונקציה החדשה
};
