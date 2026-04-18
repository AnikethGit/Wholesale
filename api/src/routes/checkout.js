import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get checkout session
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

    // Get cart
    let cartId;
    if (req.user) {
      const [carts] = await connection.query(
        'SELECT id FROM carts WHERE user_id = ? AND status = "active"',
        [req.user.id]
      );
      cartId = carts[0]?.id;
    } else {
      const sessionToken = req.headers['x-session-token'];
      const [carts] = await connection.query(
        'SELECT id FROM carts WHERE session_token = ? AND status = "active"',
        [sessionToken]
      );
      cartId = carts[0]?.id;
    }

    if (!cartId) {
      connection.release();
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Get cart items with pricing
    const [items] = await connection.query(
      'SELECT ci.*, p.name FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = ?',
      [cartId]
    );

    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
    const tax = subtotal * 0.08; // 8% tax
    const shippingCost = shipping_method === 'express' ? 15 : subtotal > 150 ? 0 : 9.99;
    const total = subtotal + tax + shippingCost;

    // Create session token
    const sessionToken = uuidv4();

    // Store checkout session in memory (could use Redis in production)
    const checkoutSession = {
      sessionToken,
      cartId,
      userId: req.user?.id,
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
      items,
      createdAt: new Date()
    };

    connection.release();

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

    const { 
      sessionToken, 
      payment_method, 
      card_number, 
      cvv 
    } = req.body;

    // Mock payment validation
    if (payment_method === 'credit_card') {
      if (!card_number || !cvv) {
        return res.status(400).json({ message: 'Card details required' });
      }

      // Mock decline for test card
      if (card_number === '4000000000000002') {
        return res.status(400).json({ message: 'Payment declined' });
      }
    }

    const connection = await pool.getConnection();

    // Get cart for this session (simplified - in production, fetch stored session)
    let cart;
    if (req.user) {
      const [carts] = await connection.query(
        'SELECT id FROM carts WHERE user_id = ? AND status = "active"',
        [req.user.id]
      );
      cart = carts[0];
    }

    if (!cart) {
      connection.release();
      return res.status(400).json({ message: 'Invalid session' });
    }

    // Get cart items
    const [items] = await connection.query(
      'SELECT * FROM cart_items WHERE cart_id = ?',
      [cart.id]
    );

    if (items.length === 0) {
      connection.release();
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
    const tax = subtotal * 0.08;
    const shippingCost = 9.99;
    const total = subtotal + tax + shippingCost;

    // Create order
    const orderNumber = `ORD-${Date.now()}`;
    const [orderResult] = await connection.query(
      `INSERT INTO orders 
       (order_number, user_id, subtotal, tax_amount, shipping_cost, total_amount, status, payment_status, payment_method, payment_gateway)
       VALUES (?, ?, ?, ?, ?, ?, 'processing', 'paid', ?, 'mock_payment')`,
      [orderNumber, req.user?.id || null, subtotal, tax, shippingCost, total, payment_method]
    );

    const orderId = orderResult.insertId;

    // Create order items
    for (const item of items) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, variant_id, product_name, product_sku, quantity, unit_price)
         SELECT ?, ?, ?, name, sku, ?, ? FROM products WHERE id = ?`,
        [orderId, item.product_id, item.variant_id, item.quantity, item.unit_price, item.product_id]
      );

      // Update product inventory
      await connection.query(
        'UPDATE products SET quantity = quantity - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );

      // Log inventory change
      await connection.query(
        'INSERT INTO inventory_logs (product_id, variant_id, quantity_change, reason, order_id) VALUES (?, ?, ?, ?, ?)',
        [item.product_id, item.variant_id, -item.quantity, 'purchase', orderId]
      );
    }

    // Create payment record
    const transactionId = `TXN-${Date.now()}`;
    await connection.query(
      'INSERT INTO payments (order_id, amount, payment_method, status, gateway_name, transaction_id, processed_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [orderId, total, payment_method, 'completed', 'mock_payment', transactionId]
    );

    // Update cart status
    await connection.query(
      'UPDATE carts SET status = "converted" WHERE id = ?',
      [cart.id]
    );

    connection.release();

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

    // Get order items
    const [items] = await connection.query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [order.id]
    );

    // Get shipment if exists
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
