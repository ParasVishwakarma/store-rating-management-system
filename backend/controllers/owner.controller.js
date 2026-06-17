const ownerService = require('../services/owner.service');

const getOwnerDashboard = async (req, res, next) => {
  try {
    const dashboard = await ownerService.getOwnerDashboard(req.user.id);
    res.status(200).json({
      success: true,
      data: dashboard
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOwnerDashboard
};
