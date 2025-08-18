const roomModel = require('../models/room_M');

async function getAllRooms(req, res, next) {
    try {
        const [rooms] = await roomModel.getAll();
        res.json(rooms);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getAllRooms
};