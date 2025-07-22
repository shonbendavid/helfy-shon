const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

const router = express.Router();

const {
  DB_HOST = 'tidb',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'testdb',
  JWT_SECRET = 'your-very-secure-secret'
} = process.env;

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  let connection;
  try {
    connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    });

    const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Create JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    // Log user login activity with log4js
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    req.logger.info({
      timestamp: new Date().toISOString(),
      userId: user.id,
      action: 'login',
      ip: ip,
    });

    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    if (connection) await connection.end();
  }
});

module.exports = router;
