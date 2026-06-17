const db = require('../config/db');

const getStores = async (userId, filters, sort) => {
  const conditions = [];
  const values = [];

  if (filters.name) {
    conditions.push('s.name LIKE ?');
    values.push(`%${filters.name}%`);
  }
  if (filters.address) {
    conditions.push('s.address LIKE ?');
    values.push(`%${filters.address}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortFields = ['name', 'address', 'averageRating', 'created_at'];
  const safeOrder = sort.order && sort.order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  const safeSortBy = allowedSortFields.includes(sort.sortBy) ? sort.sortBy : 'created_at';

  const sql = `
    SELECT s.id, s.name, s.email, s.address, s.created_at,
           COALESCE(ROUND(AVG(r.rating), 2), 0) AS averageRating,
           (SELECT r2.id
 FROM ratings r2
 WHERE r2.store_id = s.id
 AND r2.user_id = ?
 LIMIT 1) AS userRatingId,

(SELECT r2.rating
 FROM ratings r2
 WHERE r2.store_id = s.id
 AND r2.user_id = ?
 LIMIT 1) AS userRating
    FROM stores s
    LEFT JOIN ratings r ON s.id = r.store_id
    ${whereClause}
    GROUP BY s.id
    ORDER BY ${safeSortBy} ${safeOrder}
  `;

  const queryValues = [userId, userId, ...values];
  const [rows] = await db.query(sql, queryValues);

  console.log("STORES FOUND:", rows);

  return rows.map(row => ({
    ...row,
    userRating: row.userRating || null
  }));
};

module.exports = {
  getStores
};
