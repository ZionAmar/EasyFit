const db = require("../database");

// שליפת כל החדרים
async function getRooms(req, res, next) {
  try {
    const [rows] = await db.query("SELECT * FROM rooms");
    req.rooms = rows;
    next();
  } catch (err) {
    req.error = { status: 500, message: "Error fetching rooms" };
    next(err);
  }
}

// שליפת חדר לפי ID
async function getRoomById(req, res, next) {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM rooms WHERE id = ?", [id]);
    if (rows.length === 0) {
      req.error = { status: 404, message: "Room not found" };
      return next();
    }
    req.room = rows[0];
    next();
  } catch (err) {
    req.error = { status: 500, message: "Error fetching room" };
    next(err);
  }
}

// יצירת חדר
async function createRoom(req, res, next) {
  const { name, capacity, is_available, has_equipment } = req.body;

  if (!name || !capacity) {
    req.error = { status: 400, message: "Missing required fields" };
    return next();
  }

  try {
    const [result] = await db.query(
      "INSERT INTO rooms (name, capacity, is_available, has_equipment) VALUES (?, ?, ?, ?)",
      [name, capacity, is_available ? 1 : 0, has_equipment ? 1 : 0]
    );

    req.newRoom = {
      id: result.insertId,
      name,
      capacity,
      is_available,
      has_equipment,
    };
    next();
  } catch (err) {
    req.error = { status: 500, message: "Error creating room" };
    next(err);
  }
}

// עדכון חדר
async function updateRoom(req, res, next) {
  const { id } = req.params;
  const { name, capacity, is_available, has_equipment } = req.body;

  if (!id) {
    req.error = { status: 400, message: "Missing id" };
    return next();
  }

  try {
    const [result] = await db.query(
      "UPDATE rooms SET name = ?, capacity = ?, is_available = ?, has_equipment = ? WHERE id = ?",
      [name, capacity, is_available ? 1 : 0, has_equipment ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      req.error = { status: 404, message: "Room not found" };
      return next();
    }

    req.updatedRoom = { id, name, capacity, is_available, has_equipment };
    next();
  } catch (err) {
    req.error = { status: 500, message: "Error updating room" };
    next(err);
  }
}

// מחיקת חדר
async function deleteRoom(req, res, next) {
  const { id } = req.params;

  if (!id) {
    req.error = { status: 400, message: "Missing id" };
    return next();
  }

  try {
    const [result] = await db.query("DELETE FROM rooms WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      req.error = { status: 404, message: "Room not found" };
      return next();
    }

    req.deletedMessage = { message: "Room deleted successfully" };
    next();
  } catch (err) {
    req.error = { status: 500, message: "Error deleting room" };
    next(err);
  }
}

module.exports = { getRooms, getRoomById, createRoom, updateRoom, deleteRoom };
