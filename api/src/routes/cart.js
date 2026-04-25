import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get cart
router.get('/', optionalAuthMiddleware, async (req, res, next) => {
  try {
    const connection = await pool.getConnection();
    let cart;

    if (req.user) {
      // Authenticated user
      const [carts] = await connection.query(
        'SELECT id FROM carts WHERE user_id = ? AND status = "active"',
        [req.user.id]
      );

      if (carts.length === 0) {
        connection.release();
        return res.json({ cart: null, items: [] });
      }

      cart = carts[0];
    } else {
      // Guest session
      let sessionToken = req.headers['x-session-token'];
      if (!sessionToken) {
        sessionToken = uuidv4();
        res.setHeader('X-Session-Token', sessionToken);
      }

      const [carts] = await connection.query(
        'SELECT id FROM carts WHERE session_token = ? AND status = "active"',
        [sessionToken]
      );

      if (carts.length === 0) {
        connection.release();
        return res.json({ cart: null, items: [], sessionToken });
      }

      cart = carts[0];
    }

    // Get cart items
    const [items] = await connection.query(
      `SELECT ci.*, p.name AS product_name, p.sku AS product_sku, p.image_url 
       FROM cart_items ci 
       JOIN products p ON ci.product_id = p.id 
       WHERE ci.cart_id = ?`,
      [cart.id]
    );

    connection.release();

    const totalPrice = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

    res.json({
      cart: { id: cart.id, total_price: totalPrice },
      items,
      sessionToken: req.user ? undefined : (req.headers['x-session-token'] || sessionToken)
    });
  } catch (error) {
    next(error);
  }
});

// Add to cart
router.post('/items', [
  body('product_id').isInt(),
  body('quantity').isInt({ min: 1 }),
  body('variant_id').optional().isInt()
], optionalAuthMiddleware, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { product_id, quantity, variant_id } = req.body;
    const connection = await pool.getConnection();

    // Get product info
    const [products] = await connection.query(
      'SELECT price FROM products WHERE id = ? AND is_active = TRUE',
      [product_id]
    );

    if (products.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Product not found' });
    }

    let cartId;
    if (req.user) {
      // Get or create cart for user
      const [carts] = await connection.query(
        'SELECT id FROM carts WHERE user_id = ? AND status = "active"',
        [req.user.id]
      );

      if (carts.length === 0) {
        const [result] = await connection.query(
          'INSERT INTO carts (user_id, status) VALUES (?, "active")',
          [req.user.id]
        );
        cartId = result.insertId;
      } else {
        cartId = carts[0].id;
      }
    } else {
      // Get or create cart for guest
      let sessionToken = req.headers['x-session-token'] || uuidv4();

      const [carts] = await connection.query(
        'SELECT id FROM carts WHERE session_token = ? AND status = "active"',
        [sessionToken]
      );

      if (carts.length === 0) {
        const [result] = await connection.query(
          'INSERT INTO carts (session_token, status) VALUES (?, "active")',
          [sessionToken]
        );
        cartId = result.insertId;
      } else {
        cartId = carts[0].id;
      }

      res.setHeader('X-Session-Token', sessionToken);
    }

    const unitPrice = products[0].price;

    // Add or update cart item
    const [existing] = await connection.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ? AND variant_id <=> ?',
      [cartId, product_id, variant_id || null]
    );

    if (existing.length > 0) {
      await connection.query(
        'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
        [quantity, existing[0].id]
      );
    } else {
      await connection.query(
        'INSERT INTO cart_items (cart_id, product_id, variant_id, quantity, unit_price) VALUES (?, ?, ?, ?, ?)',
        [cartId, product_id, variant_id || null, quantity, unitPrice]
      );
    }

    connection.release();

    res.status(201).json({ message: 'Item added to cart' });
  } catch (error) {
    next(error);
  }
});

// Update cart item
router.patch('/items/:id', [
  body('quantity').isInt({ min: 0 })
], authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const connection = await pool.getConnection();

    if (quantity === 0) {
      await connection.query('DELETE FROM cart_items WHERE id = ?', [id]);
    } else {
      await connection.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, id]);
    }

    connection.release();

    res.json({ message: 'Cart updated' });
  } catch (error) {
    next(error);
  }
});

// Remove from cart
router.delete('/items/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    await connection.query('DELETE FROM cart_items WHERE id = ?', [id]);

    connection.release();

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    next(error);
  }
});

// Clear cart
router.delete('/', optionalAuthMiddleware, async (req, res, next) => {
  try {
    const connection = await pool.getConnection();

    if (req.user) {
      const [carts] = await connection.query(
        'SELECT id FROM carts WHERE user_id = ? AND status = "active"',
        [req.user.id]
      );

      if (carts.length > 0) {
        await connection.query('DELETE FROM cart_items WHERE cart_id = ?', [carts[0].id]);
      }
    }

    connection.release();

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
});

export default router;
