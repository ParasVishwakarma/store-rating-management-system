const db = require('../config/db');

const getOwnerDashboard = async (ownerId) => {

  console.log("OWNER ID:", ownerId);

  const [stores] = await db.query(
    'SELECT * FROM stores WHERE owner_id = ?',
    [ownerId]
  );

  console.log("STORES:", stores);
  if (stores.length === 0) {
    return {
      stores: [],
      averageRating: 0,
      ratings: []
    };
  }

  const storeIds = stores.map(s => s.id);

  const [avgRows] = await db.query(
    `SELECT COALESCE(ROUND(AVG(r.rating), 2), 0) AS averageRating
     FROM ratings r
     WHERE r.store_id IN (?)`,
    [storeIds]
  );

  const [ratings] = await db.query(
    `SELECT r.id,
       r.rating,
       r.store_id AS storeId,
       r.created_at,
       u.name AS userName,
       u.email AS userEmail,
       s.name AS storeName
     FROM ratings r
     JOIN users u ON r.user_id = u.id
     JOIN stores s ON r.store_id = s.id
     WHERE r.store_id IN (?)
     ORDER BY r.created_at DESC`,
    [storeIds]
  );

  return {
    stores,
    averageRating: avgRows[0].averageRating,
    ratings
  };
};

module.exports = {
  getOwnerDashboard
};
