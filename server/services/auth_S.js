const { encWithSalt } = require('../middlewares/auth_Midd');
const userModel = require('../models/user_M');
const studioModel = require('../models/studio_M');
const jwt = require('jsonwebtoken'); 
const jwtSecret = process.env.jwtSecret; 

const login = async ({ userName, pass }) => {
    const user = await userModel.getByUserName(userName);
    
    if (!user) {
        const error = new Error("שם משתמש לא קיים במערכת");
        error.status = 401; 
        error.errorType = 'USER_NOT_FOUND'; 
        throw error;
    }
    
    if (user.password_hash !== encWithSalt(pass)) {
        const error = new Error("הסיסמה שהוזנה שגויה");
        error.status = 401; 
        error.errorType = 'INCORRECT_PASSWORD';
        throw error;
    }
    
    const [studiosAndRoles] = await userModel.findStudiosAndRolesByUserId(user.id);
    const { password_hash, ...userDetails } = user;
    
    return { userDetails, studios: studiosAndRoles };
};

const verifyUserFromId = async (userId) => {
    const [[user]] = await userModel.getById(userId);
    if (!user) {
        const error = new Error("User not found for verification");
        error.status = 401;
        throw error;
    }

    const [studiosAndRoles] = await userModel.findStudiosAndRolesByUserId(user.id);
    const { password_hash, ...userDetails } = user;

    return { userDetails, studios: studiosAndRoles };
};

const register = async (userData) => {
    const { studio_name, admin_full_name, email, password, userName } = userData;

    if (!studio_name || !admin_full_name || !email || !password || !userName) {
        const error = new Error("שם סטודיו, שם מלא, אימייל, שם משתמש וסיסמה הם שדות חובה.");
        error.status = 400; 
        throw error;
    }
    
    const existingEmail = await userModel.getByEmail(email);
    if (existingEmail) {
        const error = new Error("כתובת האימייל הזו כבר רשומה במערכת");
        error.status = 409; 
        error.field = 'email'; 
        throw error;
    }

    const existingUserName = await userModel.getByUserName(userName);
    if (existingUserName) {
        const error = new Error("שם המשתמש שבחרת תפוס, נסה שם אחר.");
        error.status = 409; 
        error.field = 'userName'; 
        throw error;
    }

    const existingStudio = await studioModel.getByName(studio_name);
    if (existingStudio) {
        const error = new Error("סטודיו בשם זה כבר קיים במערכת");
        error.status = 409; 
        error.field = 'studio_name'; 
        throw error;
    }

    const password_hash = encWithSalt(password);
    
    return studioModel.createStudioWithNewAdmin({
        studio_name,
        admin_full_name,
        email,
        password_hash,
        userName
    });
};

const impersonate = async (ownerId, targetUserId) => {
    const [ownerRoles] = await userModel.findStudiosAndRolesByUserId(ownerId);
    const isOwner = ownerRoles.some(roleInfo => roleInfo.role_name === 'owner');
    if (!isOwner) {
        const error = new Error("Only an owner can perform this action.");
        error.status = 403;
        throw error;
    }

    if (ownerId === targetUserId) {
        const error = new Error("Cannot impersonate yourself.");
        error.status = 400;
        throw error;
    }
    
    const { userDetails, studios } = await verifyUserFromId(targetUserId).catch(err => {
        if (err.status === 401) {
            const error = new Error("Target user not found.");
            error.status = 400;
            throw error;
        }
        throw err;
    });

    const tokenPayload = { id: userDetails.id, isImpersonating: true };
    const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: '1h' });
    return { token, userDetails, studios };
};

module.exports = {
    login,
    register,
    verifyUserFromId,
    impersonate
};