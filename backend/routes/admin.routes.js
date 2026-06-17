const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const {
  createUserRules,
  createStoreRules,
  handleValidation
} = require('../middleware/validate');

router.use(auth, authorize('admin'));

router.get('/dashboard', adminController.getDashboard);
router.post('/users', createUserRules, handleValidation, adminController.createUser);
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.post('/stores', createStoreRules, handleValidation, adminController.createStore);
router.get('/stores', adminController.getStores);

module.exports = router;
