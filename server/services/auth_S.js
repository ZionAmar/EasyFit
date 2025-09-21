const { encWithSalt } = require('../middlewares/auth_Midd');
const userModel = require('../models/user_M');

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
            userName: user.userName
        },
        studios: studiosAndRoles
    };
};

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
    
    const existingUser = await userModel.getByUserName(userName);
    if (existingUser) throw new Error("שם משתמש כבר קיים במערכת");

    const existingEmail = await userModel.getByEmail(email);
    if (existingEmail) throw new Error("האימייל שהוזן כבר קיים במערכת");

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