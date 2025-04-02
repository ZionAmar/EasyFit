const db = require("../database");

// שליפת כל המפגשים
async function getMeetings(req, res, next) {
  try {
    const [rows] = await db.query("SELECT * FROM meetings");
    req.meetings = rows;
    next();
  } catch (err) {
    req.error = { status: 500, message: "Error fetching meetings" };
    next(err);
  }
}

// שליפת מפגש לפי ID
async function getMeetingById(req, res, next) {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM meetings WHERE id = ?", [id]);
    if (rows.length === 0) {
      req.error = { status: 404, message: "Meeting not found" };
      return next();
    }
    req.meeting = rows[0];
    next();
  } catch (err) {
    req.error = { status: 500, message: "Error fetching meeting" };
    next(err);
  }
}

// יצירת מפגש חדש
async function createMeeting(req, res, next) {
  const {
    name,
    trainer_id,
    date,
    start_time,
    end_time,
    room_id,
    participant_count,
  } = req.body;

  if (
    !name ||
    !trainer_id ||
    !date ||
    !start_time ||
    !end_time ||
    !room_id ||
    !participant_count
  ) {
    req.error = { status: 400, message: "Missing required fields" };
    return next();
  }

  try {
    // בדיקת קיבולת החדר
    const [roomRows] = await db.query(
      "SELECT capacity FROM rooms WHERE id = ?",
      [room_id]
    );
    if (roomRows.length === 0) {
      req.error = { status: 400, message: "Room not found" };
      return next();
    }

    const capacity = roomRows[0].capacity;
    if (parseInt(participant_count) > capacity) {
      req.error = {
        status: 400,
        message: `כמות המשתתפים חורגת מהקיבולת המותרת (${capacity}) של החדר הנבחר.`,
      };
      return next();
    }

    const [result] = await db.query(
      "INSERT INTO meetings (name, trainer_id, date, start_time, end_time, room_id, participant_count) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, trainer_id, date, start_time, end_time, room_id, participant_count]
    );

    req.newMeeting = {
      id: result.insertId,
      name,
      trainer_id,
      date,
      start_time,
      end_time,
      room_id,
      participant_count,
    };
    next();
  } catch (err) {
    req.error = { status: 500, message: "Error creating meeting" };
    next(err);
  }
}

// עדכון מפגש קיים
async function updateMeeting(req, res, next) {
  const { id } = req.params;
  const {
    name,
    trainer_id,
    date,
    start_time,
    end_time,
    room_id,
    participant_count,
  } = req.body;

  if (!id) {
    req.error = { status: 400, message: "Missing id" };
    return next();
  }

  try {
    const [roomRows] = await db.query(
      "SELECT capacity FROM rooms WHERE id = ?",
      [room_id]
    );
    if (roomRows.length === 0) {
      req.error = { status: 400, message: "Room not found" };
      return next();
    }

    const capacity = roomRows[0].capacity;
    if (parseInt(participant_count) > capacity) {
      req.error = {
        status: 400,
        message: `כמות המשתתפים חורגת מהקיבולת המותרת (${capacity}) של החדר הנבחר.`,
      };
      return next();
    }

    const [result] = await db.query(
      "UPDATE meetings SET name = ?, trainer_id = ?, date = ?, start_time = ?, end_time = ?, room_id = ?, participant_count = ? WHERE id = ?",
      [
        name,
        trainer_id,
        date,
        start_time,
        end_time,
        room_id,
        participant_count,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      req.error = { status: 404, message: "Meeting not found" };
      return next();
    }

    req.updatedMeeting = {
      id,
      name,
      trainer_id,
      date,
      start_time,
      end_time,
      room_id,
      participant_count,
    };
    next();
  } catch (err) {
    req.error = { status: 500, message: "Error updating meeting" };
    next(err);
  }
}

// מחיקת מפגש
async function deleteMeeting(req, res, next) {
  const { id } = req.params;

  if (!id) {
    req.error = { status: 400, message: "Missing id" };
    return next();
  }

  try {
    const [result] = await db.query("DELETE FROM meetings WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      req.error = { status: 404, message: "Meeting not found" };
      return next();
    }

    req.deletedMessage = { message: "Meeting deleted successfully" };
    next();
  } catch (err) {
    req.error = { status: 500, message: "Error deleting meeting" };
    next(err);
  }
}

module.exports = {
  getMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  deleteMeeting,
};
