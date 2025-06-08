// >> קובץ: services/auth_S.js
// >> תיקון: פישוט הלוגיקה, החזרת אובייקט משתמש מלא ותקין.

const md5 = require('md5');
const userModel = require('../models/user_M');

const Salt = process.env.Salt;
const encWithSalt = (str) => md5(Salt + str);

const login = async ({ userName, pass }) => {
  // FIX: הפונקציה מקבלת רק את המידע שהיא צריכה, לא את כל req, res
  const user = await userModel.getByCredentials(userName, encWithSalt(pass));
  
  // כאן הבדיקה הקריטית. אם המשתמש הוא null, תיזרק שגיאה
  if (!user) {
    throw new Error("שם משתמש או סיסמה שגויים");
  }

  // FIX: מחזירים את האובייקט המלא עם התפקידים שלו
  return { 
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      roles: userModel.getRolesFromFlags(user)
  };
};

const register = async (userData) => {
  const existing = await userModel.getByUserName(userData.userName);
  if (existing) throw new Error("שם משתמש כבר קיים במערכת");

  userData.password_hash = encWithSalt(userData.pass);

  // IMPROVEMENT: משתמש חדש מקבל אוטומטית תפקיד 'member'
  const roles = ['member'];

  return userModel.createFull({
    full_name: userData.full_name,
    userName: userData.userName,
    password_hash: userData.password_hash,
    email: userData.email,
    phone: userData.phone,
    roles,
  });
};

module.exports = {
  login,
  register,
};
