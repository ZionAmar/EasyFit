const userService = require('../services/user_S');

// --- Owner Controller Functions ---
async function getAllSystemUsers(req, res, next) {
    try {
        const users = await userService.getAllSystemUsers();
        res.json(users);
    } catch (err) {
        next(err);
    }
}

async function ownerUpdateUser(req, res, next) {
    try {
        const updatedUser = await userService.ownerUpdate(req.params.id, req.body);
        res.json(updatedUser);
    } catch (err) {
        next(err);
    }
}

async function ownerDeleteUser(req, res, next) {
    try {
        await userService.ownerDelete(req.params.id);
        res.status(204).end();
    } catch (err) {
        next(err);
    }
}

async function ownerAssignRole(req, res, next) {
    try {
        const { userId } = req.params;
        const { studioId, roleName } = req.body;
        const result = await userService.assignRole({ userId, studioId, roleName });
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
}

async function ownerRemoveRole(req, res, next) {
    try {
        const { userId, studioId, roleName } = req.params;
        await userService.removeRole({ userId, studioId, roleName });
        res.status(204).end();
    } catch (err) {
        next(err);
    }
}

// --- Admin/General Controller Functions ---
async function getUsersForStudio(req, res, next) {
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
    // This is a studio-specific removal by an admin
    await userService.delete(req.params.id, req.user.studioId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

async function getAvailableTrainers(req, res, next) {
    try {
        const { studioId } = req.user;
        const { date, start_time, end_time, meetingId } = req.query;
        const trainers = await userService.getAvailableTrainers({ studioId, date, start_time, end_time, excludeMeetingId: meetingId });
        res.json(trainers);
    } catch (err) {
        next(err);
    }
}

async function updateProfile(req, res, next) {
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

const getUsersByStudio = async (req, res, next) => {
    try {
        const { studioId } = req.params;
        const users = await userService.getAll({ studioId });
        res.json(users);
    } catch (err) {
        next(err);
    }
};

async function ownerRemoveRole(req, res, next) { /* ... */ }

// --- הוספה חדשה ---
async function ownerCreateUser(req, res, next) {
    try {
        const newUser = await userService.ownerCreate(req.body);
        res.status(201).json(newUser);
    } catch (err) {
        next(err);
    }
}

module.exports = {
  getAllSystemUsers,
  ownerUpdateUser,
  ownerDeleteUser,
  ownerAssignRole,
  ownerRemoveRole,
  getUsersForStudio,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAvailableTrainers,
  updateProfile,
  getUsersByStudio,
  ownerRemoveRole,
  ownerCreateUser, 
};