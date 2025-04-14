const db = require("../database");
const { sendWhatsappWithConfirmLink } = require("../utils/twilioSms");

async function confirmSpot(req, res, next) {
  const { registrationId } = req.params;

  try {
    const [result] = await db.query(
      "UPDATE meeting_registrations SET status = 'active' WHERE id = ?",
      [registrationId]
    );

    if (result.affectedRows === 0) {
      req.error = { status: 404, message: "רישום לא נמצא או כבר בוצע שינוי" };
      return next();
    }

    next();
  } catch (err) {
    req.error = { status: 500, message: "שגיאה באישור ההשתתפות" };
    next();
  }
}

async function declineSpot(req, res, next) {
  const { registrationId } = req.params;

  try {
    // ביטול ראשון
    await db.query(
      "UPDATE meeting_registrations SET status = 'cancelled' WHERE id = ?",
      [registrationId]
    );

    // שליפת פרטי הרישום שבוטל
    const [[cancelledRow]] = await db.query(
      "SELECT meeting_id FROM meeting_registrations WHERE id = ?",
      [registrationId]
    );

    if (!cancelledRow) {
      req.error = { status: 404, message: "רישום לא נמצא" };
      return next();
    }

    // הבא בתור
    const [nextList] = await db.query(
      "SELECT mr.id, u.phone FROM meeting_registrations mr JOIN users u ON u.id = mr.user_id WHERE mr.meeting_id = ? AND mr.status = 'waiting' ORDER BY mr.registered_at ASC LIMIT 1",
      [cancelledRow.meeting_id]
    );

    if (nextList.length > 0) {
      const nextUser = nextList[0];
      await sendWhatsappWithConfirmLink(
        nextUser.phone,
        cancelledRow.meeting_id,
        nextUser.id
      );
    }

    next();
  } catch (err) {
    req.error = { status: 500, message: "שגיאה בביטול ושליחת הזמנה לבא בתור" };
    next();
  }
}

module.exports = { confirmSpot, declineSpot };
