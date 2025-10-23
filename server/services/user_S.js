const md5 = require('md5');
const userModel = require('../models/user_M');
const Salt = process.env.Salt;
const path = require('path'); 
const fs = require('fs');

const encWithSalt = (str) => md5(Salt + str);

// --- Owner Service Functions ---
async function getAllSystemUsers() {
    const users = await userModel.findAllWithRoles();
    // The query now returns a valid JSON string, so we might not need to parse it
    // depending on the DB driver. If it's a string, parsing is needed.
    return users.map(user => {
        if (typeof user.roles === 'string') {
            try {
                user.roles = JSON.parse(user.roles);
            } catch (e) {
                user.roles = []; // Handle potential malformed JSON
            }
        }
        return user;
    });
}

async function ownerUpdate(id, data) {
    // Owner can update core details and status
    const { full_name, email, phone, status } = data;
    await getById(id); // Ensure user exists
    return userModel.update(id, { full_name, email, phone, status });
}

async function ownerDelete(id) {
    await getById(id); // Ensure user exists
    return userModel.remove(id); // This is a hard delete from the 'users' table
}

async function assignRole({ userId, studioId, roleName }) {
    return userModel.addRole({ userId, studioId, roleName });
}

async function removeRole({ userId, studioId, roleName }) {
    return userModel.removeRole({ userId, studioId, roleName });
}


// --- Admin/General Service Functions ---
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

// Admin can only remove a user from their studio, not a hard delete.
async function remove(userId, studioId) {
  await getById(userId);
  return userModel.removeUserFromStudio(userId, studioId);
}

async function updateProfile(id, data) {
    const currentUser = await getById(id);
    if (currentUser.profile_picture_url && data.profile_picture_url) {
        const oldImageName = path.basename(currentUser.profile_picture_url);
        const oldImagePath = path.join(__dirname, '..', 'public', 'avatars', oldImageName);
        fs.unlink(oldImagePath, (err) => {
            if (err) console.error(`Failed to delete old avatar: ${oldImagePath}`, err);
            else console.log(`Successfully deleted old avatar: ${oldImagePath}`);
        });
    }
    await userModel.updateProfile(id, data);
    const [[updatedUser]] = await userModel.getById(id);
    return updatedUser;
}

async function getAvailableTrainers(filters) {
    const [trainers] = await userModel.findAvailableTrainers(filters);
    return trainers;
}

async function removeRole({ userId, studioId, roleName }) { /* ... */ }

// --- הוספה חדשה ---
async function ownerCreate(data) {
    const { pass, userName, email, full_name, phone } = data;

    // ולידציות חשובות
    if (!pass || !userName || !email || !full_name) {
        throw new Error("שם מלא, אימייל, שם משתמש וסיסמה הם שדות חובה.");
    }

    const existingUser = await userModel.getByUserName(userName);
    if (existingUser) throw new Error("שם משתמש כבר קיים במערכת");
    
    const existingEmail = await userModel.getByEmail(email);
    if (existingEmail) throw new Error("האימייל שהוזן כבר קיים במערכת");

    const password_hash = encWithSalt(pass);
    // אנו קוראים לפונקציית המודל הבסיסית ליצירה
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
  removeRole,
ownerCreate,
};