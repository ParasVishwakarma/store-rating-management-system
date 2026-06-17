const db = require('../config/db');

const submitRating = async (userId, storeId, rating) => {
  const [storeRows] = await db.query('SELECT id FROM stores WHERE id = ?', [storeId]);
  if (storeRows.length === 0) {
    const error = new Error('Store not found.');
    error.statusCode = 404;
    throw error;
  }

  const [existing] = await db.query(
    'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
    [userId, storeId]
  );
  if (existing.length > 0) {
    const error = new Error('You have already rated this store. Use update to change your rating.');
    error.statusCode = 409;
    throw error;
  }

  const [result] = await db.query(
    'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
    [userId, storeId, rating]
  );

  return {
    id: result.insertId,
    userId,
    storeId,
    rating
  };
};

const updateRating = async (ratingId, userId, newRating) => {
  const [rows] = await db.query(
    'SELECT * FROM ratings WHERE id = ? AND user_id = ?',
    [ratingId, userId]
  );

  if (rows.length === 0) {
    const error = new Error('Rating not found or you are not authorized to update it.');
    error.statusCode = 404;
    throw error;
  }

  await db.query(
    'UPDATE ratings SET rating = ? WHERE id = ? AND user_id = ?',
    [newRating, ratingId, userId]
  );

  return {
    id: ratingId,
    userId,
    storeId: rows[0].store_id,
    rating: newRating
  };
};

module.exports = {
  submitRating,
  updateRating
};
