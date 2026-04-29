import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard analytics
router.get('/analytics', adminMiddleware, async (req, res, next) => {
  try {
    const connection = await pool.getConnection();

    // Total revenue
    const [revenue] = await connection.query(
      'SELECT SUM(total_amount) as total FROM orders WHERE payment_status = "paid"'
    );

    // Total orders
    const [orders] = await connection.query(
      'SELECT COUNT(*) as total FROM orders'
    );

    // Total products
    const [products] = await connection.query(
      'SELECT COUNT(*) as total FROM products'
    );

    // Total users
    const [users] = await connection.query(
      'SELECT COUNT(*) as total FROM users WHERE role = "customer"'
    );

    // Recent orders
    const [recentOrders] = await connection.query(
      'SELECT * FROM orders ORDER BY created_at DESC LIMIT 10'
    );

    // Top products
    const [topProducts] = await connection.query(
      `SELECT p.*, COUNT(oi.id) as order_count
       FROM products p
       LEFT JOIN order_items oi ON p.id = oi.product_id
       GROUP BY p.id
       ORDER BY order_count DESC
       LIMIT 10`
    );

    connection.release();

    res.json({
      summary: {
        revenue: revenue[0].total || 0,
        orders: orders[0].total,
        products: products[0].total,
        users: users[0].total
      },
      recentOrders,
      topProducts
    });
  } catch (error) {
    next(error);
  }
});

// Get all products (admin)
router.get('/products', adminMiddleware, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const connection = await pool.getConnection();

    const [products] = await connection.query(
      'SELECT * FROM products ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    const [countResult] = await connection.query(
      'SELECT COUNT(*) as total FROM products'
    );

    connection.release();

    res.json({
      data: products,
      pagination: { page, limit, total: countResult[0].total }
    });
  } catch (error) {
    next(error);
  }
});

// Create product
router.post('/products', adminMiddleware, [
  body('category_id').isInt(),
  body('sku').notEmpty(),
  body('name').notEmpty(),
  body('slug').notEmpty(),
  body('price').isFloat({ min: 0 }),
  body('quantity').isInt({ min: 0 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      category_id, sku, name, slug, description, short_description, price,
      compare_at_price, cost_price, quantity, is_featured, specifications
    } = req.body;

    const connection = await pool.getConnection();

    const [result] = await connection.query(
      `INSERT INTO products 
       (category_id, sku, name, slug, description, short_description, price, compare_at_price, cost_price, quantity, is_featured, specifications)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id, sku, name, slug, description || null, short_description || null,
        price, compare_at_price || null, cost_price || null, quantity || 0, 
        is_featured || false, JSON.stringify(specifications || {})
      ]
    );

    connection.release();

    res.status(201).json({
      message: 'Product created',
      product: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
});

// Update product
router.patch('/products/:id', adminMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = [];
    const values = [];

    const allowedFields = [
      'category_id', 'name', 'slug', 'description', 'short_description',
      'price', 'compare_at_price', 'cost_price', 'quantity', 'is_featured',
      'is_active', 'specifications'
    ];

    Object.entries(req.body).forEach(([key, value]) => {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        values.push(key === 'specifications' ? JSON.stringify(value) : value);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(id);
    const connection = await pool.getConnection();

    await connection.query(
      `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    connection.release();

    res.json({ message: 'Product updated' });
  } catch (error) {
    next(error);
  }
});

// Delete product
router.delete('/products/:id', adminMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    await connection.query('DELETE FROM products WHERE id = ?', [id]);

    connection.release();

    res.json({ message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
});

// Get all orders (admin)
router.get('/orders', adminMiddleware, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const connection = await pool.getConnection();

    let query = 'SELECT * FROM orders';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [orders] = await connection.query(query, params);

    connection.release();

    res.json({
      data: orders,
      pagination: { page, limit }
    });
  } catch (error) {
    next(error);
  }
});

// Update order status
router.patch('/orders/:id', adminMiddleware, [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;
    const connection = await pool.getConnection();

    await connection.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );

    connection.release();

    res.json({ message: 'Order updated' });
  } catch (error) {
    next(error);
  }
});

// Create shipment
router.post('/orders/:orderId/shipment', adminMiddleware, [
  body('tracking_number').notEmpty(),
  body('carrier').notEmpty(),
  body('estimated_delivery').optional().isISO8601()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId } = req.params;
    const { tracking_number, carrier, estimated_delivery } = req.body;
    const connection = await pool.getConnection();

    const [result] = await connection.query(
      `INSERT INTO shipments (order_id, tracking_number, carrier, estimated_delivery)
       VALUES (?, ?, ?, ?)`,
      [orderId, tracking_number, carrier, estimated_delivery || null]
    );

    await connection.query(
      'UPDATE orders SET status = "shipped" WHERE id = ?',
      [orderId]
    );

    connection.release();

    res.status(201).json({
      message: 'Shipment created',
      shipment: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
});

export default router;

// ── Manual Order Creation ─────────────────────────────────────────────────
router.post('/orders/manual', adminMiddleware, [
  body('customer_email').isEmail(),
  body('customer_first_name').notEmpty(),
  body('customer_last_name').notEmpty(),
  body('items').isArray({ min: 1 }),
  body('items.*.name').notEmpty(),
  body('items.*.quantity').isInt({ min: 1 }),
  body('items.*.unit_price').isFloat({ min: 0 }),
  body('shipping_address').notEmpty(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const {
      customer_email, customer_first_name, customer_last_name, customer_phone,
      items, shipping_address, billing_address,
      payment_method = 'manual', payment_status = 'paid',
      order_status = 'processing', notes
    } = req.body;

    const connection = await pool.getConnection();

    // Find or create user account for customer
    let userId = null;
    const [existingUser] = await connection.query(
      'SELECT id FROM users WHERE email = ?', [customer_email]
    );
    if (existingUser.length > 0) {
      userId = existingUser[0].id;
    }

    // Calculate totals from line items
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const taxAmount   = parseFloat(req.body.tax_amount  ?? (subtotal * 0.08).toFixed(2));
    const shippingCost = parseFloat(req.body.shipping_cost ?? 0);
    const discountAmount = parseFloat(req.body.discount_amount ?? 0);
    const total = subtotal + taxAmount + shippingCost - discountAmount;

    const orderNumber = `ORD-MANUAL-${Date.now()}`;

    const [orderResult] = await connection.query(
      `INSERT INTO orders
         (order_number, user_id, guest_email, subtotal, tax_amount, shipping_cost,
          discount_amount, total_amount, status, payment_status, payment_method,
          payment_gateway, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'manual', ?)`,
      [
        orderNumber,
        userId,
        userId ? null : customer_email,
        subtotal, taxAmount, shippingCost, discountAmount, total,
        order_status, payment_status, payment_method,
        notes || null
      ]
    );
    const orderId = orderResult.insertId;

    // Insert order items (free-text, no product_id required for manual orders)
    for (const item of items) {
      await connection.query(
        `INSERT INTO order_items
           (order_id, product_id, variant_id, product_name, product_sku, quantity, unit_price)
         VALUES (?, ?, NULL, ?, ?, ?, ?)`,
        [orderId, item.product_id || null, item.name, item.sku || 'MANUAL', item.quantity, item.unit_price]
      );
      // Deduct stock only when a real product_id is given
      if (item.product_id) {
        await connection.query(
          'UPDATE products SET quantity = GREATEST(0, quantity - ?) WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }
    }

    // Record payment
    const transactionId = `TXN-MANUAL-${Date.now()}`;
    await connection.query(
      `INSERT INTO payments
         (order_id, amount, payment_method, status, gateway_name, transaction_id, processed_at)
       VALUES (?, ?, ?, ?, 'manual', ?, NOW())`,
      [orderId, total, payment_method, payment_status === 'paid' ? 'completed' : payment_status, transactionId]
    );

    // Store shipping address as JSON in notes if no address table row
    if (shipping_address) {
      await connection.query(
        `UPDATE orders SET notes = ? WHERE id = ?`,
        [JSON.stringify({
          notes: notes || '',
          customer: { first_name: customer_first_name, last_name: customer_last_name, email: customer_email, phone: customer_phone },
          shipping_address,
          billing_address: billing_address || shipping_address
        }), orderId]
      );
    }

    connection.release();

    res.status(201).json({
      message: 'Order created',
      order: { id: orderId, order_number: orderNumber, total }
    });
  } catch (error) {
    next(error);
  }
});

// ── Invoice Data (admin) ──────────────────────────────────────────────────
router.get('/orders/:id/invoice', adminMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    const [orders] = await connection.query(
      'SELECT * FROM orders WHERE id = ? OR order_number = ?', [id, id]
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

    // Parse embedded customer/address from notes if it was a manual order
    let parsedNotes = null;
    try { if (order.notes) parsedNotes = JSON.parse(order.notes); } catch {}

    connection.release();

    res.json({
      order,
      items,
      payment:  payments[0]  || null,
      shipment: shipments[0] || null,
      customer: customer || parsedNotes?.customer || { email: order.guest_email },
      shipping_address: parsedNotes?.shipping_address || null,
      billing_address:  parsedNotes?.billing_address  || null,
    });
  } catch (error) { next(error); }
});
