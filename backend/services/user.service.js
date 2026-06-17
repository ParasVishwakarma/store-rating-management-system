const db = require('../config/db');

const getProfile = async (userId) => {
  const [rows] = await db.query(
    'SELECT id, name, email, address, role, created_at FROM users WHERE id = ?',
    [userId]
  );

  if (rows.length === 0) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  return rows[0];
};

module.exports = {
  getProfile
};
