const md5 = require('md5');
const userModel = require('../models/user_M');
const Salt = process.env.Salt;
const path = require('path'); 
const fs = require('fs');

const encWithSalt = (str) => md5(Salt + str);

async function getAllSystemUsers() {
    const users = await userModel.findAllWithRoles();
    return users.map(user => {
        if (typeof user.roles === 'string') {
            try {
                user.roles = JSON.parse(user.roles);
            } catch (e) {
                user.roles = []; 
            }
        }
        return user;
    });
}

async function ownerUpdate(id, data) {
    const { full_name, email, phone, status } = data;
    const user = await getById(id); 
    if (!user) {
        const error = new Error('User not found.');
        error.status = 404;
        throw error;
    }
    return userModel.update(id, { full_name, email, phone, status });
}

async function ownerDelete(id) {
    const user = await getById(id); 
    if (!user) {
        const error = new Error('User not found.');
        error.status = 404;
        throw error;
    }
    return userModel.remove(id); 
}

async function assignRole({ userId, studioId, roleName }) {
    return userModel.addRole({ userId, studioId, roleName });
}

async function removeRole({ userId, studioId, roleName }) {
    console.log(`--- EXECUTION REACHED removeRole SERVICE with params:`, { userId, studioId, roleName });
    return userModel.removeRole({ userId, studioId, roleName });
}


async function getAll(filters) {
    const [rows] = await userModel.getAll(filters);
    return rows;
}

async function getById(id) {
    const [[user]] = await userModel.getById(id);
    if (!user) {
        const error = new Error('המשתמש לא נמצא.');
        error.status = 404;
        throw error;
    }
    return user;
}

async function create(data) {
    const { pass, userName, email, ...userData } = data;

    const existingUser = await userModel.getByUserName(userName);
    if (existingUser) {
        const error = new Error("שם משתמש כבר קיים במערכת");
        error.status = 409; 
        error.field = 'userName';
        throw error;
    }
    
    const existingEmail = await userModel.getByEmail(email);
    if (existingEmail) {
        const error = new Error("האימייל שהוזן כבר קיים במערכת");
        error.status = 409; 
        error.field = 'email';
        throw error;
    }

    if (!pass) {
        const error = new Error("Password is required for a new user.");
        error.status = 400;
        throw error;
    }

    const password_hash = encWithSalt(pass);
    const finalUserData = { ...userData, userName, email, password_hash };
    
    return userModel.create(finalUserData);
}

async function update(id, data) {
    const user = await getById(id); 
    if (!user) {
        const error = new Error('User not found for update.');
        error.status = 404;
        throw error;
    }
    return userModel.update(id, data);
}

async function remove(userId, studioId) {
    const user = await getById(userId);
    if (!user) {
        const error = new Error('User not found for removal.');
        error.status = 404;
        throw error;
    }
    return userModel.removeUserFromStudio(userId, studioId);
}

async function updateProfile(id, data) {
    const currentUser = await getById(id);
    if (!currentUser) {
        const error = new Error('User not found to update profile.');
        error.status = 404;
        throw error;
    }
    
    const shouldDeleteImage = data.delete_image === 'true';

    if (shouldDeleteImage && currentUser.profile_picture_url) {
        const oldImageName = path.basename(currentUser.profile_picture_url);
        const oldImagePath = path.join(__dirname, '..', 'public', 'avatars', oldImageName);
        
        if (fs.existsSync(oldImagePath)) {
            fs.unlink(oldImagePath, (err) => {
                if (err) console.error(`Failed to delete old avatar: ${oldImagePath}`, err);
                else console.log(`Successfully deleted old avatar: ${oldImagePath}`);
            });
        }
        data.profile_picture_url = null;

    } else if (currentUser.profile_picture_url && data.profile_picture_url) {
        const oldImageName = path.basename(currentUser.profile_picture_url);
        const oldImagePath = path.join(__dirname, '..', 'public', 'avatars', oldImageName);
        if (fs.existsSync(oldImagePath)) {
            fs.unlink(oldImagePath, (err) => {
                if (err) console.error(`Failed to delete old avatar: ${oldImagePath}`, err);
            });
        }
    }
    
    delete data.delete_image;
    
    await userModel.updateProfile(id, data);
    const [[updatedUser]] = await userModel.getById(id);
    return updatedUser;
}

async function getAvailableTrainers(filters) {
    const [trainers] = await userModel.findAvailableTrainers(filters);
    return trainers;
}

async function ownerCreate(data) {
    const { pass, userName, email, full_name, phone } = data;

    if (!pass || !userName || !email || !full_name) {
        const error = new Error("שם מלא, אימייל, שם משתמש וסיסמה הם שדות חובה.");
        error.status = 400;
        throw error;
    }

    const existingUser = await userModel.getByUserName(userName);
    if (existingUser) {
        const error = new Error("שם משתמש כבר קיים במערכת");
        error.status = 409;
        error.field = 'userName';
        throw error;
    }
    
    const existingEmail = await userModel.getByEmail(email);
    if (existingEmail) {
        const error = new Error("האימייל שהוזן כבר קיים במערכת");
        error.status = 409;
        error.field = 'email';
        throw error;
    }

    const password_hash = encWithSalt(pass);
    return userModel.create({ full_name, email, userName, password_hash, phone });
}

async function changePassword(userId, currentPassword, newPassword) {
    const user = await getById(userId); 

    const currentPasswordHash = encWithSalt(currentPassword);
    if (user.password_hash !== currentPasswordHash) {
        const error = new Error('הסיסמה הנוכחית שגויה.');
        error.status = 400; 
        throw error;
    }

    const newPasswordHash = encWithSalt(newPassword);

    await userModel.updatePassword(userId, newPasswordHash);
    
    return { message: "Password updated." };
}

module.exports = {
    getAllSystemUsers,
    ownerUpdate,
    ownerDelete,
    assignRole,
    removeRole,
    getAll,
    getById,
    create,
    update,
    delete: remove,
    updateProfile,
    getAvailableTrainers,
    ownerCreate,
    changePassword
};