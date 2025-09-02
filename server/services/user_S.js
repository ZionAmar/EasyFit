// קובץ: server/services/user_S.js
const userModel = require('../models/user_M');

async function getAll() {
  // המודל userModel.getAll() כבר מחזיר את המידע על המשתמשים כולל התפקידים שלהם.
  // אין צורך לבצע עיבוד נוסף.
  const [rows] = await userModel.getAll();
  return rows;
}

async function getById(id) {
  const [[user]] = await userModel.getById(id); // המודל מחזיר מערך בתוך מערך
  if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
  }
  // המודל כבר מחזיר את המשתמש עם רשימת התפקידים שלו.
  return user;
}

async function create(data) {
  // פונקציה זו שמורה בעיקר ליצירת משתמשים דרך פאנל ניהול.
  // הלוגיקה המורכבת יותר של הרשמה נמצאת ב-auth_S.js
  return userModel.create(data);
}

async function update(id, data) {
  // קודם כל, נוודא שהמשתמש קיים לפני שמנסים לעדכן אותו
  await getById(id); 
  return userModel.update(id, data);
}

async function remove(id) {
  // נוודא שהמשתמש קיים לפני שמנסים למחוק אותו
  await getById(id);
  return userModel.remove(id);
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: remove,
};