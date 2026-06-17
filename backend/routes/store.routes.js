const express = require('express');
const router = express.Router();
const storeController = require('../controllers/store.controller');
const auth = require('../middleware/auth');

router.get('/', auth, storeController.getStores);

module.exports = router;
