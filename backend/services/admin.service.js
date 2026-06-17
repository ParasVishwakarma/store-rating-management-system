const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { buildWhereClause, buildOrderByClause } = require('../utils/helpers');

const getDashboardStats = async () => {
  const [[{ totalUsers }]] = await db.query('SELECT COUNT(*) AS totalUsers FROM users');
  const [[{ totalStores }]] = await db.query('SELECT COUNT(*) AS totalStores FROM stores');
  const [[{ totalRatings }]] = await db.query('SELECT COUNT(*) AS totalRatings FROM ratings');

  return { totalUsers, totalStores, totalRatings };
};

const createUser = async (data) => {
  const {
    name,
    email,
    password,
    address,
    role,
    storeId
  } = data;

  const [existing] = await db.query(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  if (existing.length > 0) {
    const error = new Error('Email already registered.');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await db.query(
    'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    [name, email, hashedPassword, address, role]
  );

  // Assign store to owner automatically
  if (role === 'store_owner' && storeId) {

    const [storeRows] = await db.query(
      'SELECT owner_id FROM stores WHERE id = ?',
      [storeId]
    );

    if (storeRows.length === 0) {
      const error = new Error('Store not found.');
      error.statusCode = 404;
      throw error;
    }

    if (storeRows[0].owner_id) {
      const error = new Error('Store already assigned to another owner.');
      error.statusCode = 400;
      throw error;
    }

    await db.query(
      'UPDATE stores SET owner_id = ? WHERE id = ?',
      [result.insertId, storeId]
    );
  }

  return {
    id: result.insertId,
    name,
    email,
    address,
    role
  };
};

const getUsers = async (filters, sort) => {
  const allowedFields = ['name', 'email', 'address', 'role'];
  const { clause, values } = buildWhereClause(filters, allowedFields);

  const allowedSortFields = ['name', 'email', 'address', 'role', 'created_at'];
  const orderBy = buildOrderByClause(sort.sortBy, sort.order, allowedSortFields, 'created_at');

  const sql = `SELECT id, name, email, address, role, created_at FROM users ${clause} ${orderBy}`;
  const [rows] = await db.query(sql, values);

  return rows;
};

const getUserById = async (id) => {
  const [rows] = await db.query(
    'SELECT id, name, email, address, role, created_at FROM users WHERE id = ?',
    [id]
  );

  if (rows.length === 0) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const user = rows[0];

  if (user.role === 'store_owner') {
    const [stores] = await db.query(
      `SELECT s.id, s.name, s.email, s.address,
              COALESCE(ROUND(AVG(r.rating), 2), 0) AS averageRating
       FROM stores s
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE s.owner_id = ?
       GROUP BY s.id`,
      [id]
    );
    user.stores = stores;

    user.storeRating =
      stores.length > 0
        ? stores[0].averageRating
        : 0;
  }

  return user;
};

const createStore = async (data) => {
  const { name, email, address, ownerId = null } = data;

  if (ownerId) {
    const [ownerRows] = await db.query(
      'SELECT id, role FROM users WHERE id = ?',
      [ownerId]
    );

    if (ownerRows.length === 0) {
      throw new Error('Owner not found.');
    }

    if (ownerRows[0].role !== 'store_owner') {
      throw new Error('Specified user is not a store owner.');
    }
  }

  const [existing] = await db.query('SELECT id FROM stores WHERE email = ?', [email]);
  if (existing.length > 0) {
    const error = new Error('Store email already in use.');
    error.statusCode = 409;
    throw error;
  }

  const [result] = await db.query(
    'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
    [name, email, address, ownerId || null]
  );

  return {
    id: result.insertId,
    name,
    email,
    address,
    ownerId
  };
};

const getStores = async (filters, sort) => {
  const conditions = [];
  const values = [];

  if (filters.name) {
    conditions.push('s.name LIKE ?');
    values.push(`%${filters.name}%`);
  }
  if (filters.email) {
    conditions.push('s.email LIKE ?');
    values.push(`%${filters.email}%`);
  }
  if (filters.address) {
    conditions.push('s.address LIKE ?');
    values.push(`%${filters.address}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortFields = ['name', 'email', 'address', 'averageRating', 'created_at'];
  const safeOrder = sort.order && sort.order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  const safeSortBy = allowedSortFields.includes(sort.sortBy) ? sort.sortBy : 'created_at';

  const sql = `
    SELECT s.id, s.name, s.email, s.address, s.owner_id AS ownerId, s.created_at,
           COALESCE(ROUND(AVG(r.rating), 2), 0) AS averageRating
    FROM stores s
    LEFT JOIN ratings r ON s.id = r.store_id
    ${whereClause}
    GROUP BY s.id
    ORDER BY ${safeSortBy} ${safeOrder}
  `;

  const [rows] = await db.query(sql, values);
  return rows;
};

module.exports = {
  getDashboardStats,
  createUser,
  getUsers,
  getUserById,
  createStore,
  getStores
};
