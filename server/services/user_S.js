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
    await getById(id); 
    return userModel.update(id, { full_name, email, phone, status });
}

async function ownerDelete(id) {
    await getById(id); 
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
      const error = new Error('User not found');
      error.status = 404;
      throw error;
  }
  return user;
}

async function create(data) {
    const { pass, userName, email, ...userData } = data;

    const existingUser = await userModel.getByUserName(userName);
    if (existingUser) throw new Error("שם משתמש כבר קיים במערכת");
    
    const existingEmail = await userModel.getByEmail(email);
    if (existingEmail) throw new Error("האימייל שהוזן כבר קיים במערכת");

    if (!pass) throw new Error("Password is required for a new user.");

    const password_hash = encWithSalt(pass);
    const finalUserData = { ...userData, userName, email, password_hash };
    
    return userModel.create(finalUserData);
}

async function update(id, data) {
  await getById(id); 
  return userModel.update(id, data);
}

async function remove(userId, studioId) {
  await getById(userId);
  return userModel.removeUserFromStudio(userId, studioId);
}

async function updateProfile(id, data) {
    const currentUser = await getById(id);
    
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
        throw new Error("שם מלא, אימייל, שם משתמש וסיסמה הם שדות חובה.");
    }

    const existingUser = await userModel.getByUserName(userName);
    if (existingUser) throw new Error("שם משתמש כבר קיים במערכת");
    
    const existingEmail = await userModel.getByEmail(email);
    if (existingEmail) throw new Error("האימייל שהוזן כבר קיים במערכת");

    const password_hash = encWithSalt(pass);
    return userModel.create({ full_name, email, userName, password_hash, phone });
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
};