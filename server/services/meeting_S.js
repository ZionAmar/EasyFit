const meetingModel = require('../models/meeting_M');

// הפונקציה מקבלת עכשיו פרמטר 'requestedRole'
const getMeetingsForUser = async (user, date, requestedRole) => {
    
    // אם לא נשלח תפקיד ספציפי, נשתמש בברירת המחדל הישנה (התפקיד הבכיר ביותר)
    const roleToUse = requestedRole || (user.roles.includes('admin') ? 'admin' : user.roles.includes('trainer') ? 'trainer' : 'member');

    // אבטחה: ודא שלמשתמש אכן יש את ההרשאה שהוא מבקש
    if (!user.roles.includes(roleToUse)) {
        return []; // מחזירים מערך ריק אם למשתמש אין הרשאה כזו
    }

    // הלוגיקה החדשה והברורה באמצעות switch
    switch (roleToUse) {
        case 'admin':
            const [adminMeetings] = await meetingModel.getAll(date);
            return adminMeetings;
        case 'trainer':
            const [trainerMeetings] = await meetingModel.getByTrainerId(user.id, date);
            return trainerMeetings;
        case 'member':
            const [memberMeetings] = await meetingModel.getByMemberId(user.id, date);
            return memberMeetings;
        default:
            return [];
    }
};

module.exports = {
    getMeetingsForUser
};