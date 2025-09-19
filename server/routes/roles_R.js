const express = require('express');
const router = express.Router();
const db = require('../config/db_config');
const { isLoggedIn } = require('../middlewares/auth_Midd');

// GET all roles
router.get('/', isLoggedIn, async (req, res, next) => {
    try {
        const [roles] = await db.query('SELECT id, name FROM roles');
        res.json(roles);
    } catch (err) {
        next(err);
    }
});

module.exports = router;