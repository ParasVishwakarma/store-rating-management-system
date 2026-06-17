const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (data) => {
  const { name, email, password, address } = data;

  const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    const error = new Error('Email already registered.');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await db.query(
    'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    [name, email, hashedPassword, address, 'user']
  );

  return {
    id: result.insertId,
    name,
    email,
    address,
    role: 'user'
  };
};

const login = async (email, password) => {

  console.log("=================================");
  console.log("EMAIL RECEIVED:", email);
  console.log("PASSWORD RECEIVED:", password);

  const [rows] = await db.query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );

  console.log("ROWS FOUND:", rows.length);

  if (rows.length === 0) {
    console.log("USER NOT FOUND");
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const user = rows[0];

  console.log("DB USER EMAIL:", user.email);
  console.log("DB HASH:", user.password);

  const isMatch = await bcrypt.compare(
    password,
    user.password
  );

  console.log("PASSWORD MATCH:", isMatch);
  console.log("=================================");
  console.log("JWT_SECRET:", process.env.JWT_SECRET);
  console.log("LOGIN SUCCESS");

  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role
    }
  };
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
  if (rows.length === 0) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
  if (!isMatch) {
    const error = new Error('Current password is incorrect.');
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

  return { message: 'Password updated successfully.' };
};

module.exports = {
  register,
  login,
  changePassword
};
