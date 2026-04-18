import request from 'supertest';
import app from '../server.js';
import pool from '../config/database.js';

describe('Checkout Routes', () => {
  let testUser = {
    email: 'checkout-test@example.com',
    password: 'Test@1234',
    first_name: 'Checkout',
    last_name: 'User'
  };

  let accessToken = null;
  let cartId = null;
  let productId = null;

  beforeAll(async () => {
    const connection = await pool.getConnection();

    // Clean up
    await connection.query('DELETE FROM users WHERE email = ?', [testUser.email]);
    connection.release();

    // Register and login test user
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    accessToken = registerRes.body.accessToken;
  });

  afterAll(async () => {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM users WHERE email = ?', [testUser.email]);
    connection.release();
  });

  describe('Cart Setup', () => {
    it('should get or create cart', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
    });

    it('should add product to cart', async () => {
      // Get a product from database
      const connection = await pool.getConnection();
      const [products] = await connection.query(
        'SELECT id FROM products LIMIT 1'
      );
      connection.release();

      if (products.length === 0) {
        throw new Error('No products in database for testing');
      }

      productId = products[0].id;

      const response = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          product_id: productId,
          quantity: 2,
          variant_id: null
        });

      expect(response.status).toBe(201);
    });

    it('should fetch cart with items', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.items.length).toBeGreaterThan(0);
      expect(response.body.items[0].product_id).toBe(productId);
    });
  });

  describe('POST /api/checkout/session', () => {
    it('should create checkout session', async () => {
      const response = await request(app)
        .post('/api/checkout/session')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: testUser.email,
          first_name: testUser.first_name,
          last_name: testUser.last_name,
          phone: '555-0123',
          shipping_address: {
            street_address: '123 Main St',
            city: 'San Francisco',
            postal_code: '94102',
            country: 'United States'
          },
          billing_address: {
            street_address: '123 Main St',
            city: 'San Francisco',
            postal_code: '94102',
            country: 'United States'
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.sessionToken).toBeDefined();
      expect(response.body.summary).toBeDefined();
      expect(response.body.summary.total).toBeGreaterThan(0);
      expect(response.body.summary.itemCount).toBeGreaterThan(0);
    });

    it('should reject empty cart', async () => {
      // Create new user with empty cart
      const newUser = {
        email: 'empty-cart@example.com',
        password: 'Test@1234',
        first_name: 'Empty',
        last_name: 'User'
      };

      await request(app)
        .post('/api/auth/register')
        .send(newUser);

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: newUser.email, password: newUser.password });

      const newToken = loginRes.body.accessToken;

      const response = await request(app)
        .post('/api/checkout/session')
        .set('Authorization', `Bearer ${newToken}`)
        .send({
          email: newUser.email,
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          phone: '555-0123',
          shipping_address: {
            street_address: '123 Main St',
            city: 'San Francisco',
            postal_code: '94102',
            country: 'United States'
          }
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('empty');

      // Cleanup
      const connection = await pool.getConnection();
      await connection.query('DELETE FROM users WHERE email = ?', [newUser.email]);
      connection.release();
    });
  });

  describe('POST /api/checkout/payment', () => {
    it('should process payment with valid card', async () => {
      const sessionRes = await request(app)
        .post('/api/checkout/session')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: testUser.email,
          first_name: testUser.first_name,
          last_name: testUser.last_name,
          phone: '555-0123',
          shipping_address: {
            street_address: '123 Main St',
            city: 'San Francisco',
            postal_code: '94102',
            country: 'United States'
          }
        });

      const paymentRes = await request(app)
        .post('/api/checkout/payment')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          sessionToken: sessionRes.body.sessionToken,
          payment_method: 'credit_card',
          card_number: '4111111111111111',
          cvv: '123',
          expiry: '12/25'
        });

      expect(paymentRes.status).toBe(201);
      expect(paymentRes.body.success).toBe(true);
      expect(paymentRes.body.order).toBeDefined();
      expect(paymentRes.body.order.id).toBeDefined();
      expect(paymentRes.body.transaction_id).toBeDefined();
    });

    it('should reject declined card', async () => {
      const sessionRes = await request(app)
        .post('/api/checkout/session')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: testUser.email,
          first_name: testUser.first_name,
          last_name: testUser.last_name,
          phone: '555-0123',
          shipping_address: {
            street_address: '123 Main St',
            city: 'San Francisco',
            postal_code: '94102',
            country: 'United States'
          }
        });

      const paymentRes = await request(app)
        .post('/api/checkout/payment')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          sessionToken: sessionRes.body.sessionToken,
          payment_method: 'credit_card',
          card_number: '4000000000000002',
          cvv: '123',
          expiry: '12/25'
        });

      expect(paymentRes.status).toBe(400);
      expect(paymentRes.body.message).toContain('declined');
    });

    it('should reject invalid card number', async () => {
      const sessionRes = await request(app)
        .post('/api/checkout/session')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: testUser.email,
          first_name: testUser.first_name,
          last_name: testUser.last_name,
          phone: '555-0123',
          shipping_address: {
            street_address: '123 Main St',
            city: 'San Francisco',
            postal_code: '94102',
            country: 'United States'
          }
        });

      const paymentRes = await request(app)
        .post('/api/checkout/payment')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          sessionToken: sessionRes.body.sessionToken,
          payment_method: 'credit_card',
          card_number: '1234567890123456',
          cvv: '123',
          expiry: '12/25'
        });

      expect(paymentRes.status).toBe(400);
    });
  });

  describe('GET /api/checkout/order/:orderId', () => {
    it('should retrieve order details', async () => {
      // Create order first
      const sessionRes = await request(app)
        .post('/api/checkout/session')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: testUser.email,
          first_name: testUser.first_name,
          last_name: testUser.last_name,
          phone: '555-0123',
          shipping_address: {
            street_address: '123 Main St',
            city: 'San Francisco',
            postal_code: '94102',
            country: 'United States'
          }
        });

      const paymentRes = await request(app)
        .post('/api/checkout/payment')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          sessionToken: sessionRes.body.sessionToken,
          payment_method: 'credit_card',
          card_number: '4111111111111111',
          cvv: '123',
          expiry: '12/25'
        });

      const orderId = paymentRes.body.order.id;

      const orderRes = await request(app)
        .get(`/api/checkout/order/${orderId}`);

      expect(orderRes.status).toBe(200);
      expect(orderRes.body.order.id).toBe(orderId);
      expect(orderRes.body.items).toBeDefined();
      expect(orderRes.body.items.length).toBeGreaterThan(0);
    });
  });
});
