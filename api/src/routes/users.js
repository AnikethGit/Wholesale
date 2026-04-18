import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    const connection = await pool.getConnection();

    const [users] = await connection.query(
      'SELECT id, email, first_name, last_name, phone, created_at FROM users WHERE id = ?',
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

// Update profile
router.patch('/profile', authMiddleware, [
  body('first_name').optional().trim().notEmpty(),
  body('last_name').optional().trim().notEmpty(),
  body('phone').optional().trim()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { first_name, last_name, phone } = req.body;
    const connection = await pool.getConnection();

    const updates = [];
    const values = [];

    if (first_name) {
      updates.push('first_name = ?');
      values.push(first_name);
    }
    if (last_name) {
      updates.push('last_name = ?');
      values.push(last_name);
    }
    if (phone) {
      updates.push('phone = ?');
      values.push(phone);
    }

    if (updates.length === 0) {
      connection.release();
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(req.user.id);
    await connection.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    connection.release();

    res.json({ message: 'Profile updated' });
  } catch (error) {
    next(error);
  }
});

// Get addresses
router.get('/addresses', authMiddleware, async (req, res, next) => {
  try {
    const connection = await pool.getConnection();

    const [addresses] = await connection.query(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [req.user.id]
    );

    connection.release();

    res.json({ data: addresses });
  } catch (error) {
    next(error);
  }
});

// Create address
router.post('/addresses', authMiddleware, [
  body('type').isIn(['shipping', 'billing', 'both']),
  body('first_name').notEmpty(),
  body('last_name').notEmpty(),
  body('street_address').notEmpty(),
  body('city').notEmpty(),
  body('postal_code').notEmpty(),
  body('country').notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, first_name, last_name, street_address, apt_suite, city, state_province, postal_code, country, phone, is_default } = req.body;
    const connection = await pool.getConnection();

    const [result] = await connection.query(
      `INSERT INTO addresses (user_id, type, first_name, last_name, street_address, apt_suite, city, state_province, postal_code, country, phone, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, type, first_name, last_name, street_address, apt_suite || null, city, state_province, postal_code, country, phone, is_default || false]
    );

    connection.release();

    res.status(201).json({ 
      message: 'Address created',
      address: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
});

// Update address
router.patch('/addresses/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type, first_name, last_name, street_address, apt_suite, city, state_province, postal_code, country, phone, is_default } = req.body;
    const connection = await pool.getConnection();

    const [existing] = await connection.query(
      'SELECT user_id FROM addresses WHERE id = ?',
      [id]
    );

    if (existing.length === 0 || existing[0].user_id !== req.user.id) {
      connection.release();
      return res.status(404).json({ message: 'Address not found' });
    }

    const updates = [];
    const values = [];

    [['type', type], ['first_name', first_name], ['last_name', last_name], 
     ['street_address', street_address], ['apt_suite', apt_suite], 
     ['city', city], ['state_province', state_province], 
     ['postal_code', postal_code], ['country', country], 
     ['phone', phone], ['is_default', is_default]]
      .forEach(([field, value]) => {
        if (value !== undefined) {
          updates.push(`${field} = ?`);
          values.push(value);
        }
      });

    if (updates.length === 0) {
      connection.release();
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(id);
    await connection.query(`UPDATE addresses SET ${updates.join(', ')} WHERE id = ?`, values);

    connection.release();

    res.json({ message: 'Address updated' });
  } catch (error) {
    next(error);
  }
});

// Delete address
router.delete('/addresses/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    const [existing] = await connection.query(
      'SELECT user_id FROM addresses WHERE id = ?',
      [id]
    );

    if (existing.length === 0 || existing[0].user_id !== req.user.id) {
      connection.release();
      return res.status(404).json({ message: 'Address not found' });
    }

    await connection.query('DELETE FROM addresses WHERE id = ?', [id]);

    connection.release();

    res.json({ message: 'Address deleted' });
  } catch (error) {
    next(error);
  }
});

// Get saved cards
router.get('/cards', authMiddleware, async (req, res, next) => {
  try {
    const connection = await pool.getConnection();

    const [cards] = await connection.query(
      'SELECT id, card_holder_name, card_last_four, card_brand, expiry_month, expiry_year, is_default FROM saved_cards WHERE user_id = ? ORDER BY is_default DESC',
      [req.user.id]
    );

    connection.release();

    res.json({ data: cards });
  } catch (error) {
    next(error);
  }
});

// Delete saved card
router.delete('/cards/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    const [existing] = await connection.query(
      'SELECT user_id FROM saved_cards WHERE id = ?',
      [id]
    );

    if (existing.length === 0 || existing[0].user_id !== req.user.id) {
      connection.release();
      return res.status(404).json({ message: 'Card not found' });
    }

    await connection.query('DELETE FROM saved_cards WHERE id = ?', [id]);

    connection.release();

    res.json({ message: 'Card deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
