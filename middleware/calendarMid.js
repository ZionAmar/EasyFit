const db = require("../database");
const dayjs = require("dayjs");

async function getMonthlyMeetings(req, res, next) {
  const year = parseInt(req.query.year) || dayjs().year();
  const month = parseInt(req.query.month) || dayjs().month() + 1;

  req.calendar = { year, month };

  try {
    const firstDay = dayjs(`${year}-${month}-01`);
    const startDay = firstDay.day(); // 0 = Sunday
    const daysInMonth = firstDay.daysInMonth();

    const startOfMonth = firstDay.startOf("month").format("YYYY-MM-DD");
    const endOfMonth = firstDay.endOf("month").format("YYYY-MM-DD");

    const [meetings] = await db.query(
      `SELECT * FROM meetings WHERE date BETWEEN ? AND ?`,
      [startOfMonth, endOfMonth]
    );

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
