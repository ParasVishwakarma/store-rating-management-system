const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true
  });

  try {
    console.log('Connected to MySQL server.');

    // Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    await connection.query(`USE \`${process.env.DB_NAME}\`;`);
    console.log(`Database "${process.env.DB_NAME}" ready.`);

    // Drop tables in correct order (respect foreign keys)
    await connection.query(`DROP TABLE IF EXISTS ratings;`);
    await connection.query(`DROP TABLE IF EXISTS stores;`);
    await connection.query(`DROP TABLE IF EXISTS users;`);
    console.log('Dropped existing tables.');

    // Create tables
    await connection.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        address VARCHAR(400) NOT NULL,
        role ENUM('admin', 'user', 'store_owner') NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await connection.query(`
      CREATE TABLE stores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        address VARCHAR(400) NOT NULL,
        owner_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await connection.query(`
      CREATE TABLE ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        store_id INT NOT NULL,
        rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_store (user_id, store_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
      );
    `);
    console.log('Tables created.');

    // Hash passwords
    const adminPass = await bcrypt.hash('Admin@1234', 10);
    const userPass = await bcrypt.hash('User@12345', 10);
    const ownerPass = await bcrypt.hash('Owner@1234', 10);

    // Seed users
    const users = [
      ['System Administrator User', 'admin@storerating.com', adminPass, '123 Admin Street, Admin City, AC 10001', 'admin'],
      ['John Doe Regular Customer', 'john.doe.user@gmail.com', userPass, '456 Oak Avenue, Springfield, IL 62704', 'user'],
      ['Jane Smith Regular Customer', 'jane.smith@gmail.com', userPass, '789 Maple Drive, Portland, OR 97201', 'user'],
      ['Robert Store Owner Person', 'owner.store@gmail.com', ownerPass, '321 Commerce Blvd, New York, NY 10001', 'store_owner'],
      ['Sarah Store Owner Person', 'sarah.owner@gmail.com', ownerPass, '654 Market Street, San Francisco, CA 94105', 'store_owner']
    ];

    for (const u of users) {
      await connection.query(
        'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
        u
      );
    }
    console.log('Users seeded (5 users).');

    // Seed stores (owner_id 4 = Robert, owner_id 5 = Sarah)
    const stores = [
      ['TechZone Electronics Store', 'techzone@stores.com', '100 Tech Park, Silicon Valley, CA 94025', 4],
      ['FreshMart Grocery Store', 'freshmart@stores.com', '200 Fresh Lane, Austin, TX 73301', 4],
      ['BookHaven Bookstore', 'bookhaven@stores.com', '300 Reader Road, Boston, MA 02101', 5]
    ];

    for (const s of stores) {
      await connection.query(
        'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
        s
      );
    }
    console.log('Stores seeded (3 stores).');

    // Seed ratings (user_id 2 = John, user_id 3 = Jane)
    const ratings = [
      [2, 1, 5],  // John rates TechZone 5
      [2, 2, 4],  // John rates FreshMart 4
      [2, 3, 3],  // John rates BookHaven 3
      [3, 1, 4],  // Jane rates TechZone 4
      [3, 2, 5]   // Jane rates FreshMart 5
    ];

    for (const r of ratings) {
      await connection.query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
        r
      );
    }
    console.log('Ratings seeded (5 ratings).');

    console.log('\nSeed completed successfully!');
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  } finally {
    await connection.end();
    process.exit(0);
  }
}

seed();
