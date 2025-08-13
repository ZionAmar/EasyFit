const meetingService = require('../services/meeting_S');

const getMeetings = async (req, res, next) => {
    try {
        // קוראים גם את role מה-URL
        const { date, role } = req.query; 
        
        // מעבירים את ה-role החדש לשירות
        const meetings = await meetingService.getMeetingsForUser(req.user, date, role);
        res.json(meetings);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getMeetings
};