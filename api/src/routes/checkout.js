import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// In-memory session store (sufficient for dev; swap for Redis in production)
const checkoutSessions = new Map();

// Prune sessions older than 30 minutes every 10 minutes
setInterval(() => {
  const cutoff = Date.now() - 30 * 60 * 1000;
  for (const [token, session] of checkoutSessions.entries()) {
    if (session.createdAt < cutoff) checkoutSessions.delete(token);
  }
}, 10 * 60 * 1000);

// Create checkout session
router.post('/session', optionalAuthMiddleware, [
  body('email').optional().isEmail(),
  body('first_name').notEmpty(),
  body('last_name').notEmpty(),
  body('shipping_address').notEmpty(),
  body('billing_address').optional(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      email,
      first_name,
      last_name,
      phone,
      shipping_address,
      billing_address,
      shipping_method = 'standard'
    } = req.body;

    const connection = await pool.getConnection();

    // Get active cart
    let cartId;
    if (req.user) {
      const [carts] = await connection.query(
        'SELECT id FROM carts WHERE user_id = ? AND status = "active"',
        [req.user.id]
      );
      cartId = carts[0]?.id;
    } else {
      const sessionToken = req.headers['x-session-token'];
      if (sessionToken) {
        const [carts] = await connection.query(
          'SELECT id FROM carts WHERE session_token = ? AND status = "active"',
          [sessionToken]
        );
        cartId = carts[0]?.id;
      }
    }

    if (!cartId) {
      connection.release();
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const [items] = await connection.query(
      'SELECT ci.*, p.name AS product_name FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = ?',
      [cartId]
    );

    if (items.length === 0) {
      connection.release();
      return res.status(400).json({ message: 'Cart is empty' });
    }

    connection.release();

    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
    const tax = subtotal * 0.08;
    const shippingCost = shipping_method === 'express' ? 15 : subtotal > 150 ? 0 : 9.99;
    const total = subtotal + tax + shippingCost;

    const sessionToken = uuidv4();

    checkoutSessions.set(sessionToken, {
      sessionToken,
      cartId,
      userId: req.user?.id || null,
      email: email || req.user?.email,
      first_name,
      last_name,
      phone,
      shipping_address,
      billing_address: billing_address || shipping_address,
      shipping_method,
      subtotal,
      tax,
      shippingCost,
      total,
      createdAt: Date.now()
    });

    res.json({
      sessionToken,
      summary: {
        subtotal,
        tax,
        shippingCost,
        total,
        itemCount: items.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// Process payment (mock)
router.post('/payment', [
  body('sessionToken').notEmpty(),
  body('payment_method').isIn(['credit_card', 'debit_card', 'paypal']),
  body('card_number').optional().matches(/^\d{16}$/),
  body('cvv').optional().matches(/^\d{3,4}$/),
], optionalAuthMiddleware, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sessionToken, payment_method, card_number, cvv } = req.body;

    // Validate payment details
    if (['credit_card', 'debit_card'].includes(payment_method)) {
      if (!card_number || !cvv) {
        return res.status(400).json({ message: 'Card details required' });
      }
      if (card_number === '4000000000000002') {
        return res.status(400).json({ message: 'Payment declined' });
      }
    }

    // Retrieve stored session
    const session = checkoutSessions.get(sessionToken);
    if (!session) {
      return res.status(400).json({ message: 'Invalid or expired checkout session' });
    }

    const connection = await pool.getConnection();

    // Re-fetch cart items for accurate pricing
    const [items] = await connection.query(
      'SELECT * FROM cart_items WHERE cart_id = ?',
      [session.cartId]
    );

    if (items.length === 0) {
      connection.release();
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const { subtotal, tax, shippingCost, total, userId } = session;

    // Create order
    const orderNumber = `ORD-${Date.now()}`;
    const [orderResult] = await connection.query(
      `INSERT INTO orders 
       (order_number, user_id, subtotal, tax_amount, shipping_cost, total_amount, status, payment_status, payment_method, payment_gateway)
       VALUES (?, ?, ?, ?, ?, ?, 'processing', 'paid', ?, 'mock_payment')`,
      [orderNumber, userId || null, subtotal, tax, shippingCost, total, payment_method]
    );

    const orderId = orderResult.insertId;

    // Create order items and update inventory
    for (const item of items) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, variant_id, product_name, product_sku, quantity, unit_price)
         SELECT ?, ?, ?, COALESCE(name, 'Unknown'), COALESCE(sku, ''), ?, ? FROM products WHERE id = ?`,
        [orderId, item.product_id, item.variant_id, item.quantity, item.unit_price, item.product_id]
      );

      await connection.query(
        'UPDATE products SET quantity = GREATEST(0, quantity - ?) WHERE id = ?',
        [item.quantity, item.product_id]
      );

      await connection.query(
        'INSERT INTO inventory_logs (product_id, variant_id, quantity_change, reason, order_id) VALUES (?, ?, ?, ?, ?)',
        [item.product_id, item.variant_id, -item.quantity, 'purchase', orderId]
      );
    }

    // Record payment
    const transactionId = `TXN-${Date.now()}`;
    await connection.query(
      'INSERT INTO payments (order_id, amount, payment_method, status, gateway_name, transaction_id, processed_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [orderId, total, payment_method, 'completed', 'mock_payment', transactionId]
    );

    // Mark cart as converted
    await connection.query(
      'UPDATE carts SET status = "converted" WHERE id = ?',
      [session.cartId]
    );

    connection.release();

    // Remove used session
    checkoutSessions.delete(sessionToken);

    res.status(201).json({
      success: true,
      order: {
        id: orderId,
        order_number: orderNumber,
        total,
        status: 'processing'
      },
      transaction_id: transactionId
    });
  } catch (error) {
    next(error);
  }
});

// Get order status
router.get('/order/:orderId', async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const connection = await pool.getConnection();

    const [orders] = await connection.query(
      'SELECT * FROM orders WHERE id = ? OR order_number = ?',
      [orderId, orderId]
    );

    if (orders.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orders[0];

    const [items] = await connection.query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [order.id]
    );

    const [shipments] = await connection.query(
      'SELECT * FROM shipments WHERE order_id = ?',
      [order.id]
    );

    connection.release();

    res.json({
      order,
      items,
      shipment: shipments[0] || null
    });
  } catch (error) {
    next(error);
  }
});

export default router;

// Public invoice data (by order number or ID — used by track page)
router.get('/order/:orderId/invoice', async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const connection = await pool.getConnection();

    const [orders] = await connection.query(
      'SELECT * FROM orders WHERE id = ? OR order_number = ?', [orderId, orderId]
    );
    if (!orders.length) { connection.release(); return res.status(404).json({ message: 'Order not found' }); }

    const order = orders[0];
    const [items]    = await connection.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    const [payments] = await connection.query('SELECT * FROM payments WHERE order_id = ?',   [order.id]);
    const [shipments]= await connection.query('SELECT * FROM shipments WHERE order_id = ?',  [order.id]);

    let customer = null;
    if (order.user_id) {
      const [users] = await connection.query(
        'SELECT first_name, last_name, email, phone FROM users WHERE id = ?', [order.user_id]
      );
      if (users.length) customer = users[0];
    }

    let parsedNotes = null;
    try { if (order.notes) parsedNotes = JSON.parse(order.notes); } catch {}

    connection.release();

    res.json({
      order,
      items,
      payment:          payments[0]  || null,
      shipment:         shipments[0] || null,
      customer:         customer || parsedNotes?.customer || { email: order.guest_email },
      shipping_address: parsedNotes?.shipping_address || null,
    });
  } catch (error) { next(error); }
});
