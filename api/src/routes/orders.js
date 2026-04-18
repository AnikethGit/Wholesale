import express from 'express';
import pool from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get user orders
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const connection = await pool.getConnection();

    let query = 'SELECT * FROM orders WHERE user_id = ?';
    const params = [req.user.id];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    // Count total
    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM (${query}) as total_orders`,
      params
    );

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [orders] = await connection.query(query, params);

    // Get items for each order
    for (let order of orders) {
      const [items] = await connection.query(
        'SELECT * FROM order_items WHERE order_id = ?',
        [order.id]
      );
      order.items = items;

      const [shipments] = await connection.query(
        'SELECT * FROM shipments WHERE order_id = ?',
        [order.id]
      );
      order.shipment = shipments[0] || null;
    }

    connection.release();

    res.json({
      data: orders,
      pagination: { page, limit, total: countResult[0].total }
    });
  } catch (error) {
    next(error);
  }
});

// Get order details
router.get('/:orderId', authMiddleware, async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const connection = await pool.getConnection();

    const [orders] = await connection.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, req.user.id]
    );

    if (orders.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orders[0];

    // Get items
    const [items] = await connection.query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [orderId]
    );

    // Get addresses
    const addresses = {};
    if (order.shipping_address_id) {
      const [shippingAddr] = await connection.query(
        'SELECT * FROM addresses WHERE id = ?',
        [order.shipping_address_id]
      );
      addresses.shipping = shippingAddr[0];
    }

    if (order.billing_address_id) {
      const [billingAddr] = await connection.query(
        'SELECT * FROM addresses WHERE id = ?',
        [order.billing_address_id]
      );
      addresses.billing = billingAddr[0];
    }

    // Get shipment
    const [shipments] = await connection.query(
      'SELECT * FROM shipments WHERE order_id = ?',
      [orderId]
    );

    // Get payment
    const [payments] = await connection.query(
      'SELECT * FROM payments WHERE order_id = ?',
      [orderId]
    );

    connection.release();

    res.json({
      order: {
        ...order,
        items,
        addresses,
        shipment: shipments[0] || null,
        payment: payments[0] || null
      }
    });
  } catch (error) {
    next(error);
  }
});

// Cancel order
router.post('/:orderId/cancel', authMiddleware, async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const connection = await pool.getConnection();

    const [orders] = await connection.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, req.user.id]
    );

    if (orders.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orders[0];

    // Only allow cancellation of pending orders
    if (!['pending', 'processing'].includes(order.status)) {
      connection.release();
      return res.status(400).json({ message: 'Cannot cancel this order' });
    }

    // Update order status
    await connection.query(
      'UPDATE orders SET status = "cancelled" WHERE id = ?',
      [orderId]
    );

    // Restore inventory
    const [items] = await connection.query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [orderId]
    );

    for (const item of items) {
      await connection.query(
        'UPDATE products SET quantity = quantity + ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    connection.release();

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
