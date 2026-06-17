const storeService = require('../services/store.service');

const getStores = async (req, res, next) => {
  try {
    const { name, address, sortBy, order } = req.query;
    const filters = { name, address };
    const sort = { sortBy, order };
    const stores = await storeService.getStores(req.user.id, filters, sort);
    res.status(200).json({
      success: true,
      data: stores
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStores
};
