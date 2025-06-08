const userModel = require('../models/user_M');
const { getRolesFromFlags } = require('../models/user_M');

async function getAll() {
  const [rows] = await userModel.getAll();
  return rows.map(u => ({ ...u, roles: getRolesFromFlags(u) }));
}

async function getById(id) {
  const [rows] = await userModel.getById(id);
  if (!rows.length) throw { status: 404, message: 'User not found' };
  const user = rows[0];
  return { ...user, roles: getRolesFromFlags(user) };
}

async function create(data) {
  const roles = Array.isArray(data.roles) ? data.roles : [];
  const [result] = await userModel.createBasic({ ...data, roles });
  return { id: result.insertId, ...data };
}

async function update(id, data) {
  await getById(id); // validate existence
  const roles = Array.isArray(data.roles) ? data.roles : [];
  await userModel.update(id, { ...data, roles });
  return { id, ...data };
}

async function remove(id) {
  await getById(id); // validate existence
  await userModel.remove(id);
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: remove,
};
