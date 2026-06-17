const ratingService = require('../services/rating.service');

const submitRating = async (req, res, next) => {
  try {
    const { storeId, rating } = req.body;
    const result = await ratingService.submitRating(req.user.id, storeId, rating);
    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully.',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

const updateRating = async (req, res, next) => {
  try {
    const ratingId = parseInt(req.params.id, 10);
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5.'
      });
    }

    const result = await ratingService.updateRating(ratingId, req.user.id, rating);
    res.status(200).json({
      success: true,
      message: 'Rating updated successfully.',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  submitRating,
  updateRating
};
