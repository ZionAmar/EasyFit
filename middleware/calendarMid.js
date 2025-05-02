const db = require("../database");
const dayjs = require("dayjs");

async function getMonthlyMeetings(req, res, next) {
  const year = parseInt(req.query.year) || dayjs().year();
  const month = parseInt(req.query.month) || dayjs().month() + 1;

  req.calendar = { year, month };

  try {
    const firstDay = dayjs(`${year}-${month}-01`);
    const startDay = firstDay.day();
    const daysInMonth = firstDay.daysInMonth();

    const startOfMonth = firstDay.startOf("month").format("YYYY-MM-DD");
    const endOfMonth = firstDay.endOf("month").format("YYYY-MM-DD");

    let meetings = [];

    if (req.user.role === "admin") {
      // admin רואה את כל המפגשים
      const [rows] = await db.query(
        `SELECT * FROM meetings WHERE date BETWEEN ? AND ?`,
        [startOfMonth, endOfMonth]
      );
      meetings = rows;
    }

    else if (req.user.role === "trainer") {
      // מדריך רואה רק את המפגשים שהוא מעביר
      const [rows] = await db.query(
        `SELECT * FROM meetings WHERE date BETWEEN ? AND ? AND trainer_id = ?`,
        [startOfMonth, endOfMonth, req.user.id]
      );
      meetings = rows;
    }

    else if (req.user.role === "member") {
      // חניך רואה רק מפגשים שהוא רשום אליהם בטבלה נפרדת
      const [rows] = await db.query(
        `SELECT m.* 
         FROM meetings m
         JOIN meeting_registrations p ON m.id = p.meeting_id
         WHERE m.date BETWEEN ? AND ? AND p.user_id = ?`,
        [startOfMonth, endOfMonth, req.user.id]
      );
      meetings = rows;
    }

    // סידור לפי ימים
    const meetingsByDay = {};
    meetings.forEach((meeting) => {
      const day = dayjs(meeting.date).date();
      if (!meetingsByDay[day]) meetingsByDay[day] = [];
      meetingsByDay[day].push(meeting);
    });

    req.calendar.daysInMonth = daysInMonth;
    req.calendar.startDay = startDay;
    req.meetingsByDay = meetingsByDay;

    next();
  } catch (err) {
    console.error(err);
    req.error = { status: 500, message: "שגיאה בטעינת המפגשים החודשיים" };
    next();
  }
}

module.exports = { getMonthlyMeetings };
