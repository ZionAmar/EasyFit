const userModel = require('../models/user_M'); // <-- תוסיף את השורה הזאת
const userService = require('../services/user_S');

async function getAllUsers(req, res, next) {
  try {
    // קבל את הסינון מה-query ואת הסטודיו מהמשתמש המאומת
    const { role } = req.query;
    const { studioId } = req.user;

    const [users] = await userModel.getAll({ role, studioId });
    res.json(users);
  } catch (err) {
    next(err);
  }
}

async function getUserById(req, res, next) {
  try {
    const user = await userService.getById(req.params.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function createUser(req, res, next) {
  try {
    const user = await userService.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const user = await userService.update(req.params.id, req.body);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    await userService.delete(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

async function getAvailableTrainers(req, res, next) {
    try {
        const { studioId } = req.user;
        const { date, start_time, end_time, meetingId } = req.query;
        
        const [trainers] = await userModel.findAvailableTrainers({ 
            studioId, date, start_time, end_time, excludeMeetingId: meetingId 
        });
        res.json(trainers);
    } catch (err) {
        next(err);
    }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAvailableTrainers
};
