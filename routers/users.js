const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser, getUserById } = require('../middleware/usersMid');

// עמוד הצגת כל המשתמשים
router.get('/', getUsers, (req, res) => {
    if (req.error) {
        return res.status(req.error.status).render('error', { title: "שגיאה", message: req.error.message });
    }
    res.render('users', { 
        title: "ניהול משתמשים",
        header: "רשימת משתמשים",
        users: req.users
    });
});

// עמוד הוספת משתמש
router.get('/add', (req, res) => {
    res.render('userForm', { 
        title: "הוספת משתמש חדש", 
        header: "הוספת משתמש", 
        editUser: null // אין מידע, זה טופס חדש
    });
});

// עמוד עריכת משתמש
router.get('/edit/:id', getUserById, (req, res) => {
    if (req.error) {
        return res.status(req.error.status).render('error', { title: "שגיאה", message: req.error.message });
    }
    res.render('userForm', { 
        title: "עריכת משתמש", 
        header: "עריכת משתמש", 
        editUser: req.user
    });
});

// יצירת משתמש חדש
router.post('/', createUser, (req, res) => {
    if (req.error) {
        return res.status(req.error.status).render('error', { title: "שגיאה", message: req.error.message });
    }
    res.redirect('/users');
});

// עדכון משתמש קיים
router.post('/update/:id', updateUser, (req, res) => {
    if (req.error) {
        return res.status(req.error.status).render('error', { title: "שגיאה", message: req.error.message });
    }
    res.redirect('/users');
});

// מחיקת משתמש
router.post('/delete/:id', deleteUser, (req, res) => {
    if (req.error) {
        return res.status(req.error.status).render('error', { title: "שגיאה", message: req.error.message });
    }
    res.redirect('/users');
});

module.exports = router;
