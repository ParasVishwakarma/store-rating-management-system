const adminService = require('../services/admin.service');

const getDashboard = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const user = await adminService.createUser(req.body);
    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: user
    });
  } catch (err) {
    next(err);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { name, email, address, role, sortBy, order } = req.query;
    const filters = { name, email, address, role };
    const sort = { sortBy, order };
    const users = await adminService.getUsers(filters, sort);
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await adminService.getUserById(parseInt(req.params.id, 10));
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

const createStore = async (req, res, next) => {
  try {
    const store = await adminService.createStore(req.body);
    res.status(201).json({
      success: true,
      message: 'Store created successfully.',
      data: store
    });
  } catch (err) {
    next(err);
  }
};

const getStores = async (req, res, next) => {
  try {
    const { name, email, address, sortBy, order } = req.query;
    const filters = { name, email, address };
    const sort = { sortBy, order };
    const stores = await adminService.getStores(filters, sort);
    res.status(200).json({
      success: true,
      data: stores
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
  createUser,
  getUsers,
  getUserById,
  createStore,
  getStores
};
