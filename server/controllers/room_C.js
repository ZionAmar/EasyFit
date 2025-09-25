const roomModel = require('../models/room_M');

async function getAllRooms(req, res, next) {
    try {
        const [rooms] = await roomModel.getAll(req.user.studioId);
        res.json(rooms);
    } catch (err) {
        next(err);
    }
}

async function getAvailableRooms(req, res, next) {
    try {
        const { studioId } = req.user;
        const { date, start_time, end_time, meetingId } = req.query;
        
        const [rooms] = await roomModel.findAvailable({ 
            studioId, date, start_time, end_time, excludeMeetingId: meetingId 
        });
        res.json(rooms);
    } catch (err) {
        next(err);
    }
}

async function createRoom(req, res, next) {
    try {
        const roomData = { ...req.body, studio_id: req.user.studioId };
        const [result] = await roomModel.create(roomData);
        res.status(201).json({ id: result.insertId, ...roomData });
    } catch (err) {
        next(err);
    }
}

async function updateRoom(req, res, next) {
    try {
        const { id } = req.params;
        const [result] = await roomModel.update(id, req.body);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Room not found or no changes made.' });
        }
        res.json({ id, ...req.body });
    } catch (err) {
        next(err);
    }
}

async function deleteRoom(req, res, next) {
    try {
        const { id } = req.params;
        const [result] = await roomModel.remove(id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Room not found or it has upcoming meetings.' });
        }
        res.status(204).send();
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getAllRooms,
    getAvailableRooms,
    createRoom,
    updateRoom,
    deleteRoom,
};