const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/rating.controller');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { ratingRules, handleValidation } = require('../middleware/validate');

router.post('/', auth, authorize('user'), ratingRules, handleValidation, ratingController.submitRating);
router.put('/:id', auth, authorize('user'), ratingController.updateRating);

module.exports = router;
