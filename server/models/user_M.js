const db = require('../config/db_config');

// פונקציה עוזרת להפוך roles לדגלים
const getFlagsFromRoles = (roles = []) => ({
  is_admin: roles.includes('admin') ? 1 : 0,
  is_trainer: roles.includes('trainer') ? 1 : 0,
  is_member: roles.includes('member') ? 1 : 0,
});

const getRolesFromFlags = ({ is_admin, is_trainer, is_member }) => {
  const roles = [];
  if (is_admin) roles.push('admin');
  if (is_trainer) roles.push('trainer');
  if (is_member) roles.push('member');
  return roles;
};

// קבלת כל המשתמשים
const getAll = () => db.query('SELECT * FROM users');

// קבלת משתמש לפי ID
const getById = (id) => db.query('SELECT * FROM users WHERE id = ?', [id]);

// קבלת משתמש לפי userName
const getByUserName = (userName) =>
  db.query('SELECT * FROM users WHERE userName = ?', [userName])
    .then(([rows]) => rows[0] || null);

// קבלת משתמש לפי userName + סיסמה
const getByCredentials = (userName, password_hash) =>
  db.query(
    'SELECT * FROM users WHERE userName = ? AND password_hash = ?',
    [userName, password_hash]
  ).then(([rows]) => rows[0] || null);

// יצירת משתמש מלא
const createFull = ({ full_name, userName, password_hash, email, phone, roles = [] }) => {
  const { is_admin, is_trainer, is_member } = getFlagsFromRoles(roles);

  return db.query(`
    INSERT INTO users (full_name, userName, password_hash, email, phone, is_member, is_trainer, is_admin, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `, [full_name, userName, password_hash, email, phone, is_member, is_trainer, is_admin]);
};

// יצירת משתמש בסיסי (למשל על ידי admin)
const createBasic = ({ full_name, email, roles = [] }) => {
  const { is_admin, is_trainer, is_member } = getFlagsFromRoles(roles);

  return db.query(`
    INSERT INTO users (full_name, email, is_admin, is_trainer, is_member, created_at)
    VALUES (?, ?, ?, ?, ?, NOW())
  `, [full_name, email, is_admin, is_trainer, is_member]);
};

// עדכון משתמש
const update = (id, { full_name, email, roles = [] }) => {
  const { is_admin, is_trainer, is_member } = getFlagsFromRoles(roles);

  return db.query(`
    UPDATE users SET full_name = ?, email = ?, is_admin = ?, is_trainer = ?, is_member = ?
    WHERE id = ?
  `, [full_name, email, is_admin, is_trainer, is_member, id]);
};

// מחיקה
const remove = (id) => db.query('DELETE FROM users WHERE id = ?', [id]);

module.exports = {
  getAll,
  getById,
  getByUserName,
  getFlagsFromRoles,
  getRolesFromFlags,
  getByCredentials,
  createFull,
  createBasic,
  update,
  remove,
};
