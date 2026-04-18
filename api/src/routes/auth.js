import express from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// Helper to generate tokens
const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );
  
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
  
  return { accessToken, refreshToken };
};

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('first_name').trim().notEmpty(),
  body('last_name').trim().notEmpty(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, first_name, last_name } = req.body;
    const connection = await pool.getConnection();

    // Check if user exists
    const [existingUser] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      connection.release();
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user
    const [result] = await connection.query(
      'INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, first_name, last_name]
    );

    const userId = result.insertId;
    const { accessToken, refreshToken } = generateTokens(userId, 'customer');

    // Store refresh token
    await connection.query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))',
      [userId, jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET)]
    );

    connection.release();

    res.status(201).json({
      user: { id: userId, email, first_name, last_name },
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const connection = await pool.getConnection();

    // Find user
    const [users] = await connection.query(
      'SELECT id, password_hash, first_name, last_name, role FROM users WHERE email = ? AND is_active = TRUE',
      [email]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];
    const passwordMatch = await bcryptjs.compare(password, user.password_hash);

    if (!passwordMatch) {
      connection.release();
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update last login
    await connection.query(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    // Store refresh token
    await connection.query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))',
      [user.id, refreshToken]
    );

    connection.release();

    res.json({
      user: { 
        id: user.id, 
        email, 
        first_name: user.first_name, 
        last_name: user.last_name,
        role: user.role 
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
});

// Refresh Token
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const connection = await pool.getConnection();

    const [tokens] = await connection.query(
      'SELECT id FROM refresh_tokens WHERE user_id = ? AND expires_at > NOW()',
      [decoded.id]
    );

    if (tokens.length === 0) {
      connection.release();
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const [users] = await connection.query(
      'SELECT role FROM users WHERE id = ?',
      [decoded.id]
    );

    connection.release();

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      decoded.id,
      users[0].role
    );

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// Get Current User
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.query(
      'SELECT id, email, first_name, last_name, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    connection.release();

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    next(error);
  }
});

// Logout
router.post('/logout', authMiddleware, async (req, res, next) => {
  try {
    const connection = await pool.getConnection();
    await connection.query(
      'DELETE FROM refresh_tokens WHERE user_id = ?',
      [req.user.id]
    );
    connection.release();

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
