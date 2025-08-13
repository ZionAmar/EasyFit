const meetingService = require('../services/meeting_S');

const getMeetings = async (req, res, next) => {
    try {
        const { date } = req.query; // קבלת התאריך מפרמטר ב-URL
        // העברת המשתמש והתאריך לשכבת השירות
        const meetings = await meetingService.getMeetingsForUser(req.user, date);
        res.json(meetings);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getMeetings
};