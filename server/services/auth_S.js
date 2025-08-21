// קובץ: services/auth_S.js

const md5 = require('md5');
const userModel = require('../models/user_M');

const Salt = process.env.Salt;
const encWithSalt = (str) => md5(Salt + str);

const login = async ({ userName, pass }) => {
    const user = await userModel.getByUserName(userName);
    if (!user || user.password_hash !== encWithSalt(pass)) {
        throw new Error("שם משתמש או סיסמה שגויים");
    }

    const [studiosAndRoles] = await userModel.findStudiosAndRolesByUserId(user.id);

    return {
        userDetails: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            userName: user.userName // חשוב להחזיר גם את זה
        },
        studios: studiosAndRoles
    };
};

// --- הפונקציה שהייתה חסרה ---
const verifyUserFromId = async (userId) => {
    const [[user]] = await userModel.getById(userId);
    if (!user) {
        throw new Error("User not found for verification");
    }

    const [studiosAndRoles] = await userModel.findStudiosAndRolesByUserId(user.id);

    return {
        userDetails: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
        },
        studios: studiosAndRoles
    };
};

const register = async (userData) => {
    const { userName, pass, full_name, email, phone, studioId } = userData;
    if (!studioId) throw new Error("לא ניתן להירשם ללא שיוך לסטודיו.");
    
    const existing = await userModel.getByUserName(userName);
    if (existing) throw new Error("שם משתמש כבר קיים במערכת");

    const password_hash = encWithSalt(pass);
    const roles = ['member'];

    return userModel.create({
        full_name, userName, password_hash, email, phone, roles, studioId
    });
};

module.exports = {
    login,
    register,
    verifyUserFromId
};
