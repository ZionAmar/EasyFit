const authService = require('../services/auth_S');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.jwtSecret;

const login = async (req, res, next) => {
    try {
        const { userDetails, studios } = await authService.login(req.body); 
        
        const tokenPayload = { id: userDetails.id };
        const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: '3h' });
        
        res.cookie("jwt", token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 3 * 60 * 60 * 1000 });

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