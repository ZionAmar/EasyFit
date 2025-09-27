const md5 = require('md5');
const userModel = require('../models/user_M');
const Salt = process.env.Salt;
const path = require('path'); 
const fs = require('fs');

const encWithSalt = (str) => md5(Salt + str);

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

    if (!pass) {
        throw new Error("Password is required for a new user.");
    }

    const password_hash = encWithSalt(pass);
    const finalUserData = { ...userData, userName, email, password_hash };
    
    return userModel.create(finalUserData);
}

async function update(id, data) {
  await getById(id); 
  return userModel.update(id, data);
}

async function remove(id) {
  await getById(id);
  return userModel.remove(id);
}

async function updateProfile(id, data) {
    const currentUser = await getById(id);

    if (currentUser.profile_picture_url && data.profile_picture_url) {
        const oldImageName = path.basename(currentUser.profile_picture_url);
        const oldImagePath = path.join(__dirname, '..', 'public', 'avatars', oldImageName);

        fs.unlink(oldImagePath, (err) => {
            if (err) {
                console.error(`Failed to delete old avatar: ${oldImagePath}`, err);
            } else {
                console.log(`Successfully deleted old avatar: ${oldImagePath}`);
            }
        });
    }
    
    await userModel.updateProfile(id, data);
    const [[updatedUser]] = await userModel.getById(id);
    return updatedUser;
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: remove,
  updateProfile
};