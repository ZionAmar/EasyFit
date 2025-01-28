const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser } = require('../middleware/usersMid');

// קריאה לכל המשתמשים
router.get('/', getUsers, (req, res) => {
    if (req.error) {
        return res.status(req.error.status).json({ message: req.error.message });
    }
    res.status(200).json(req.users);
});

// יצירת משתמש חדש
router.post('/', createUser, (req, res) => {
    if (req.error) {
        return res.status(req.error.status).json({ message: req.error.message });
    }
    res.status(201).json(req.newUser);
});

// עדכון משתמש קיים
router.put('/', updateUser, (req, res) => {
    if (req.error) {
        return res.status(req.error.status).json({ message: req.error.message });
    }
    res.status(200).json(req.updatedUser);
});

// מחיקת משתמש
router.delete('/', deleteUser, (req, res) => {
    if (req.error) {
        return res.status(req.error.status).json({ message: req.error.message });
    }
    res.status(200).json(req.deletedMessage);
});

module.exports = router;
