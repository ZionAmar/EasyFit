const db = require("../database");
const { sendSmsWithConfirmLink } = require("../utils/twilioSms");

async function joinMeeting(req, res, next) {
  const { meeting_id, user_id, allow_waiting } = req.body;

  if (!meeting_id || !user_id) {
    req.error = { status: 400, message: "חסרים פרטי מפגש או משתמש." };
    return next();
  }

  try {
    const [existing] = await db.query(
      "SELECT * FROM meeting_registrations WHERE meeting_id = ? AND user_id = ? AND status != 'cancelled'",
      [meeting_id, user_id]
    );
    if (existing.length > 0) {
      req.error = { status: 409, message: "כבר הצטרפת למפגש הזה." };
      return next();
    }

    const [[meeting]] = await db.query(
      `SELECT m.participant_count, r.capacity
       FROM meetings m
       JOIN rooms r ON m.room_id = r.id
       WHERE m.id = ?`,
      [meeting_id]
    );

    if (!meeting) {
      req.error = { status: 404, message: "לא נמצא מפגש או חדר מתאים." };
      return next();
    }

    const maxAllowed = Math.min(meeting.participant_count, meeting.capacity);

    const [[{ count: currentCount }]] = await db.query(
      "SELECT COUNT(*) AS count FROM meeting_registrations WHERE meeting_id = ? AND status = 'active'",
      [meeting_id]
    );

    if (currentCount >= maxAllowed) {
      // אין מקום – בודקים אם המשתמש אישר להיכנס לרשימת המתנה
      if (!allow_waiting || allow_waiting === "false") {
        req.error = {
          status: 409,
          message: "המפגש מלא. ניתן להיכנס לרשימת המתנה.",
        };
        return next();
      }
    }

    const status = currentCount < maxAllowed ? "active" : "waiting";

    await db.query(
      `INSERT INTO meeting_registrations (meeting_id, user_id, status, registered_at)
       VALUES (?, ?, ?, NOW())`,
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

async function joinWaiting(req, res, next) {
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
      req.error = { status: 409, message: "כבר רשום למפגש הזה." };
      return next();
    }

    await db.query(
      `INSERT INTO meeting_registrations (meeting_id, user_id, status, registered_at)
       VALUES (?, ?, 'waiting', NOW())`,
      [meeting_id, user_id]
    );

    req.joinStatus = "waiting";
    next();
  } catch (err) {
    console.error(err);
    req.error = { status: 500, message: "שגיאה בהרשמה לרשימת המתנה." };
    next();
  }
}

async function getUserMeetings(req, res, next) {
  const { user_id } = req.params;

  if (!user_id) {
    req.error = { status: 400, message: "חסר מזהה משתמש" };
    return next();
  }

  try {
    const [rows] = await db.query(
      `
      SELECT 
        m.id, m.name, m.date, m.start_time, m.end_time,
        r.name AS room_name,
        u.full_name AS trainer_name,
        mr.status
      FROM meeting_registrations mr
      JOIN meetings m ON mr.meeting_id = m.id
      JOIN rooms r ON m.room_id = r.id
      JOIN users u ON m.trainer_id = u.id
      WHERE mr.user_id = ?
      ORDER BY m.date, m.start_time
    `,
      [user_id]
    );

    req.userMeetings = rows;
    next();
  } catch (err) {
    console.error(err);
    req.error = { status: 500, message: "שגיאה בטעינת המפגשים שלך" };
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
        "UPDATE meeting_registrations SET status = 'pending' WHERE id = ?",
        [nextUser.id]
      );

      // שליחת הודעה 
      const [userData] = await db.query(
        "SELECT phone FROM users WHERE id = ?",
        [nextUser.user_id]
      );
      const phone = userData[0]?.phone;

      if (phone) {
        await sendSmsWithConfirmLink(phone, meeting_id, nextUser.id);
      }
    }

    next();
  } catch (err) {
    console.error(err);
    req.error = { status: 500, message: "שגיאה בביטול ההשתתפות." };
    next();
  }
}

module.exports = {
  joinMeeting,
  joinWaiting,
  cancelParticipation,
  getUserMeetings,
};
