const express = require('express');
const router = express.Router();
const { getMeetings, getMeetingById, createMeeting, updateMeeting, deleteMeeting } = require('../middleware/meetingsMid');
const { getUsers } = require('../middleware/usersMid');
const { getRooms } = require('../middleware/roomsMid');
const { getMeetingDetails } = require('../middleware/meetingsMid');

// הצגת כל המפגשים
router.get('/', getMeetings, getUsers, getRooms, (req, res) => {
    if (req.error) {
        return res.status(req.error.status).render('error', { title: "שגיאה", message: req.error.message });
    }

    const trainers = req.users.filter(user => user.is_trainer);
    const trainersMap = Object.fromEntries(trainers.map(t => [t.id, t.full_name]));
    const roomsMap = Object.fromEntries(req.rooms.map(r => [r.id, r.name]));

    const meetings = req.meetings.map(m => ({
        ...m,
        trainer_name: trainersMap[m.trainer_id] || 'לא ידוע',
        room_name: roomsMap[m.room_id] || 'לא ידוע'
    }));

    res.render('meetings', {
        title: "ניהול מפגשים",
        header: "רשימת מפגשים",
        meetings
    });
});

// הצגת פרטי מפגש
router.get('/:id', getMeetingDetails, (req, res) => {
    if (req.error) {
        return res.status(req.error.status).render('error', {
            title: 'שגיאה',
            message: req.error.message
        });
    }

    res.render('meetingDetails', {
        title: 'פרטי מפגש',
        header: req.meeting.name,
        meeting: req.meeting,
        currentCount: req.currentCount
    });
});

// עמוד הוספת מפגש
router.get('/add', getUsers, getRooms, (req, res) => {
    const trainers = req.users.filter(user => user.is_trainer);
    res.render('meetingForm', {
        title: "הוספת מפגש חדש",
        header: "הוספת מפגש",
        meeting: null,
        trainers,
        rooms: req.rooms
    });
});

// עמוד עריכת מפגש
router.get('/edit/:id', getMeetingById, getUsers, getRooms, (req, res) => {
    if (req.error) {
        return res.status(req.error.status).render('error', { title: "שגיאה", message: req.error.message });
    }

    const trainers = req.users.filter(user => user.is_trainer);
    res.render('meetingForm', {
        title: "עריכת מפגש",
        header: "עריכת מפגש",
        meeting: req.meeting,
        trainers,
        rooms: req.rooms
    });
});

// יצירת מפגש חדש
router.post('/', createMeeting, (req, res) => {
    if (req.error) {
        return res.status(req.error.status).render('error', { title: "שגיאה", message: req.error.message });
    }
    res.redirect('/meetings');
});

// עדכון מפגש
router.post('/update/:id', updateMeeting, (req, res) => {
    if (req.error) {
        return res.status(req.error.status).render('error', { title: "שגיאה", message: req.error.message });
    }
    res.redirect('/meetings');
});

// מחיקת מפגש
router.post('/delete/:id', deleteMeeting, (req, res) => {
    if (req.error) {
        return res.status(req.error.status).render('error', { title: "שגיאה", message: req.error.message });
    }
    res.redirect('/meetings');
});

module.exports = router;
