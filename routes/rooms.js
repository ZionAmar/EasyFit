const express = require('express');
const router = express.Router();
const { getRooms, getRoomById, createRoom, updateRoom, deleteRoom } = require('../middleware/roomsMid');

// כל החדרים
router.get('/', getRooms, (req, res) => {
    if (req.error) {
        return res.status(req.error.status).render('error', { title: "שגיאה", message: req.error.message });
    }
    res.render('rooms', {
        title: "ניהול חדרים",
        header: "רשימת חדרים",
        rooms: req.rooms
    });
});

// עמוד הוספה
router.get('/add', (req, res) => {
    res.render('roomForm', {
        title: "הוספת חדר חדש",
        header: "הוספת חדר",
        room: null
    });
});

// עמוד עריכה
router.get('/edit/:id', getRoomById, (req, res) => {
    if (req.error) {
        return res.status(req.error.status).render('error', { title: "שגיאה", message: req.error.message });
    }
    res.render('roomForm', {
        title: "עריכת חדר",
        header: "עריכת חדר",
        room: req.room
    });
});

// יצירה
router.post('/', createRoom, (req, res) => {
    if (req.error) {
        return res.status(req.error.status).render('error', { title: "שגיאה", message: req.error.message });
    }
    res.redirect('/rooms');
});

// עדכון
router.post('/update/:id', updateRoom, (req, res) => {
    if (req.error) {
        return res.status(req.error.status).render('error', { title: "שגיאה", message: req.error.message });
    }
    res.redirect('/rooms');
});

// מחיקה
router.post('/delete/:id', deleteRoom, (req, res) => {
    if (req.error) {
        return res.status(req.error.status).render('error', { title: "שגיאה", message: req.error.message });
    }
    res.redirect('/rooms');
});

module.exports = router;
