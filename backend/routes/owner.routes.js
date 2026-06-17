const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/owner.controller');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/dashboard', auth, authorize('store_owner'), ownerController.getOwnerDashboard);

module.exports = router;
