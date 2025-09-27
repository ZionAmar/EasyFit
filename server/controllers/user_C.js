const userModel = require('../models/user_M');
const userService = require('../services/user_S');

async function getAllUsers(req, res, next) {
  try {
    const { role } = req.query;
    const { studioId } = req.user;

    const users = await userService.getAll({ role, studioId });
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
    const userData = { ...req.body, studioId: req.user.studioId };
    const user = await userService.create(userData);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const userData = { ...req.body, studioId: req.user.studioId };
    const user = await userService.update(req.params.id, userData);
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

async function updateProfile(req, res, next) {
    console.log('--- DEBUG: [4/4] Reached the final updateProfile controller.');
    try {
        const userId = req.user.id;
        const userData = { ...req.body };

        if (req.file) {
            userData.profile_picture_url = `/avatars/${req.file.filename}`;
        }

        const updatedUser = await userService.updateProfile(userId, userData);
        res.json(updatedUser);
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
  getAvailableTrainers,
  updateProfile
};