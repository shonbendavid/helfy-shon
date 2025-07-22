const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const DB_HOST = process.env.DB_HOST || 'tidb';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'testdb';
const DB_PORT = 4000; // TiDB default port

async function init() {
  const connection = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    port: DB_PORT,
  });

  // Create database if it doesn't exist
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
  await connection.changeUser({ database: DB_NAME });

  // Create users table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      username VARCHAR(255),
      password_hash VARCHAR(255) NOT NULL
    );
  `);

  // Check if default admin exists
  const [rows] = await connection.query(`SELECT * FROM users WHERE email = ?`, ['admin@example.com']);
  if (rows.length === 0) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await connection.query(
      `INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)`,
      ['admin@example.com', 'admin', hashedPassword]
    );
    console.log('Default admin user created: admin@example.com / admin123');
  } else {
    console.log('Default admin user already exists.');
  }

  await connection.end();
}

// Export the init function for use in server.js
module.exports = init;
