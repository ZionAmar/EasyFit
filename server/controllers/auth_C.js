const authService = require('../services/auth_S');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.jwtSecret;

const login = async (req, res, next) => {
    try {
        const { userDetails, studios } = await authService.login(req.body); 
        
        // הטוקן צריך להכיל רק את המזהה הייחודי של המשתמש
        const tokenPayload = { id: userDetails.id };
        const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: '3h' });
        
        res.cookie("jwt", token, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 3 * 60 * 60 * 1000 });

        // שלח את כל המידע שהלקוח צריך כדי להתחיל לעבוד
        res.json({ userDetails, studios });
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

const verify = async (req, res, next) => {
    try {
        // req.user מגיע מה-middleware isLoggedIn המעודכן, אבל הוא ספציפי לסטודיו אחד.
        // בפעולת verify, אנחנו רוצים להחזיר את כל המידע על המשתמש כדי לאתחל את האפליקציה.
        const fullUserContext = await authService.verifyUserFromId(req.user.id);
        res.json(fullUserContext);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    login,
    register,
    logout,
    verify,
};
