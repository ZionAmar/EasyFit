const db = require("../database"); // ייבוא חיבור למסד הנתונים

// Middleware לשליפת כל המשתמשים
async function getUsers(req, res, next) {
  try {
    const [rows] = await db.query("SELECT * FROM users");
    req.users = rows;
    next();
  } catch (err) {
    req.error = { status: 500, message: "Error fetching users" };
    next(err);
  }
}

// Middleware ליצירת משתמש חדש
async function createUser(req, res, next) {
  const { full_name, email, phone, role } = req.body;

  if (!full_name || !email || !phone || !role) {
    req.error = { status: 400, message: "Missing required fields" };
    return next();
  }

  try {
    const isAdmin = role === "admin" ? 1 : 0;
    const isTrainer = role === "trainer" ? 1 : 0;
    const isMember = role === "client" ? 1 : 0;

    const [result] = await db.query(
      "INSERT INTO users (full_name, email, phone, is_admin, is_trainer, is_member) VALUES (?, ?, ?, ?, ?, ?)",
      [full_name, email, phone, isAdmin, isTrainer, isMember]
    );

    req.newUser = { id: result.insertId, full_name, email, phone, role };
    next();
  } catch (err) {
    req.error = { status: 500, message: "Error creating user" };
    next(err);
  }
}

// Middleware לעדכון משתמש קיים
async function updateUser(req, res, next) {
  const { id } = req.params;
  const { full_name, email, phone, role } = req.body;

  if (!id) {
    req.error = { status: 400, message: "Missing id" };
    return next();
  }

  try {
    const isAdmin = role === "admin" ? 1 : 0;
    const isTrainer = role === "trainer" ? 1 : 0;
    const isMember = role === "client" ? 1 : 0;

    const [result] = await db.query(
      "UPDATE users SET full_name = ?, email = ?, phone = ?, is_admin = ?, is_trainer = ?, is_member = ? WHERE id = ?",
      [full_name, email, phone, isAdmin, isTrainer, isMember, id]
    );

    if (result.affectedRows === 0) {
      req.error = { status: 404, message: "User not found" };
      return next();
    }

    req.updatedUser = { id, full_name, email, phone, role };
    next();
  } catch (err) {
    req.error = { status: 500, message: "Error updating user" };
    next(err);
  }
}

// Middleware למחיקת משתמש
async function deleteUser(req, res, next) {
  const { id } = req.params;

  if (!id) {
    req.error = { status: 400, message: "Missing id" };
    return next();
  }

  try {
    const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      req.error = { status: 404, message: "User not found" };
      return next();
    }

    req.deletedMessage = { message: "User deleted successfully" };
    next();
  } catch (err) {
    req.error = { status: 500, message: "Error deleting user" };
    next(err);
  }
}
//שליפת משתמש מסויים
async function getUserById(req, res, next) {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
    if (rows.length === 0) {
      req.error = { status: 404, message: "User not found" };
      return next();
    }
    req.user = rows[0];
    next();
  } catch (err) {
    req.error = { status: 500, message: "Error fetching user" };
    next(err);
  }
}
module.exports = { getUsers, createUser, updateUser, deleteUser, getUserById };
