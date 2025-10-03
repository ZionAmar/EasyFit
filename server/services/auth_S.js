const { encWithSalt } = require('../middlewares/auth_Midd');
const userModel = require('../models/user_M');
const studioModel = require('../models/studio_M');

const login = async ({ userName, pass }) => {
    const user = await userModel.getByUserName(userName);
    if (!user || user.password_hash !== encWithSalt(pass)) {
        throw new Error("שם משתמש או סיסמה שגויים");
    }

    const [studiosAndRoles] = await userModel.findStudiosAndRolesByUserId(user.id);
    const { password_hash, ...userDetails } = user;
    
    return { userDetails, studios: studiosAndRoles };
};

const verifyUserFromId = async (userId) => {
    const [[user]] = await userModel.getById(userId);
    if (!user) {
        throw new Error("User not found for verification");
    }

    const [studiosAndRoles] = await userModel.findStudiosAndRolesByUserId(user.id);
    const { password_hash, ...userDetails } = user;

    return { userDetails, studios: studiosAndRoles };
};

const register = async (userData) => {
    const { studio_name, admin_full_name, email, password, userName } = userData;

    if (!studio_name || !admin_full_name || !email || !password || !userName) {
        throw new Error("All fields are required for studio registration.");
    }
    
    const existingEmail = await userModel.getByEmail(email);
    if (existingEmail) {
        throw new Error("האימייל שהוזן כבר קיים במערכת");
    }

    const existingUserName = await userModel.getByUserName(userName);
    if (existingUserName) {
        throw new Error("שם המשתמש תפוס, נסה שם אחר.");
    }

    const existingStudio = await studioModel.getByName(studio_name);
    if (existingStudio) {
        throw new Error("סטודיו בשם זה כבר קיים במערכת");
    }

    const password_hash = encWithSalt(password);
    
    return studioModel.createStudioAndAdmin({
        studio_name,
        admin_full_name,
        email,
        password_hash,
        userName
    });
};

module.exports = {
    login,
    register,
    verifyUserFromId
};