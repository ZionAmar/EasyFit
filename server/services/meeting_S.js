const meetingModel = require('../models/meeting_M');

// ה-date הוא עכשיו פרמטר אופציונלי
const getMeetingsForUser = async (user, date) => {
    // הלוגיקה לא תזרוק יותר שגיאה, אלא תעביר את התאריך (או null) למודל
    if (user.roles.includes('admin')) {
        const [meetings] = await meetingModel.getAll(date);
        return meetings;
    }
    
    if (user.roles.includes('trainer')) {
        const [meetings] = await meetingModel.getByTrainerId(user.id, date);
        return meetings;
    }

    if (user.roles.includes('member')) {
        const [meetings] = await meetingModel.getByMemberId(user.id, date);
        return meetings;
    }

    return [];
};

module.exports = {
    getMeetingsForUser
};