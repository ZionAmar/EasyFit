const db = require("../database");

async function joinMeeting(req, res, next) {
  const { meeting_id, user_id } = req.body;

  if (!meeting_id || !user_id) {
    req.error = { status: 400, message: "חסרים פרטי מפגש או משתמש." };
    return next();
  }

  try {
    const [existing] = await db.query(
      "SELECT * FROM meeting_registrations WHERE meeting_id = ? AND user_id = ?",
      [meeting_id, user_id]
    );

    if (existing.length > 0) {
      req.error = { status: 409, message: "כבר הצטרפת למפגש הזה." };
      return next();
    }

    const [countRows] = await db.query(
      "SELECT COUNT(*) AS count FROM meeting_registrations WHERE meeting_id = ? AND status = 'active'",
      [meeting_id]
    );
    const currentCount = countRows[0].count;

    const [capacityRows] = await db.query(
      `SELECT r.capacity 
             FROM meetings m 
             JOIN rooms r ON m.room_id = r.id 
             WHERE m.id = ?`,
      [meeting_id]
    );

    if (capacityRows.length === 0) {
      req.error = { status: 404, message: "לא נמצא מפגש או חדר מתאים." };
      return next();
    }

    const capacity = capacityRows[0].capacity;
    const status = currentCount < capacity ? "active" : "waiting";

    await db.query(
      "INSERT INTO meeting_registrations (meeting_id, user_id, status) VALUES (?, ?, ?)",
      [meeting_id, user_id, status]
    );

    req.joinStatus = status;
    next();
  } catch (err) {
    console.error(err);
    req.error = { status: 500, message: "שגיאה בעת ההצטרפות למפגש." };
    next();
  }
}

async function cancelParticipation(req, res, next) {
  const { meeting_id, user_id } = req.body;

  if (!meeting_id || !user_id) {
    req.error = { status: 400, message: "חסרים פרטי מפגש או משתמש." };
    return next();
  }

  try {
    const [result] = await db.query(
      "UPDATE meeting_registrations SET status = 'cancelled' WHERE meeting_id = ? AND user_id = ?",
      [meeting_id, user_id]
    );

    if (result.affectedRows === 0) {
      req.error = { status: 404, message: "ההרשמה לא נמצאה." };
      return next();
    }

    const [waitingList] = await db.query(
      "SELECT * FROM meeting_registrations WHERE meeting_id = ? AND status = 'waiting' ORDER BY registered_at ASC LIMIT 1",
      [meeting_id]
    );

    if (waitingList.length > 0) {
      const nextUser = waitingList[0];
      await db.query(
        "UPDATE meeting_registrations SET status = 'active' WHERE id = ?",
        [nextUser.id]
      );
    }

    next();
  } catch (err) {
    console.error(err);
    req.error = { status: 500, message: "שגיאה בביטול ההשתתפות." };
    next();
  }
}

module.exports = { joinMeeting, cancelParticipation };
