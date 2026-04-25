import express from 'express';
import { query, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { optionalAuthMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all products with filtering and search
router.get('/', [
  query('search').optional().trim(),
  query('category').optional().trim(),
  query('sort').optional().trim(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('minPrice').optional().isFloat({ min: 0 }).toFloat(),
  query('maxPrice').optional().isFloat({ min: 0 }).toFloat(),
], optionalAuthMiddleware, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { search, category, sort = 'created_at', page = 1, limit = 12, minPrice, maxPrice } = req.query;
    const offset = (page - 1) * limit;
    const connection = await pool.getConnection();

    let query = 'SELECT * FROM products WHERE is_active = TRUE';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      query += ' AND category_id = (SELECT id FROM categories WHERE slug = ?)';
      params.push(category);
    }

    if (minPrice !== undefined) {
      query += ' AND price >= ?';
      params.push(minPrice);
    }
    if (maxPrice !== undefined) {
      query += ' AND price <= ?';
      params.push(maxPrice);
    }

    const sortMap = {
      'price_asc': 'price ASC',
      'price_desc': 'price DESC',
      'newest': 'created_at DESC',
      'rating': 'rating DESC'
    };
    query += ` ORDER BY ${sortMap[sort] || 'created_at DESC'}`;

    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM (${query}) as filtered`,
      params
    );
    const total = countResult[0].total;

    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [products] = await connection.query(query, params);

    connection.release();

    res.json({
      data: products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
});

// Get featured products — must be before /:id
router.get('/featured', optionalAuthMiddleware, async (req, res, next) => {
  try {
    const connection = await pool.getConnection();
    const [products] = await connection.query(
      'SELECT * FROM products WHERE is_featured = TRUE AND is_active = TRUE LIMIT 8',
      []
    );
    connection.release();
    res.json({ data: products });
  } catch (error) {
    next(error);
  }
});

// Get trending products — must be before /:id
router.get('/trending', optionalAuthMiddleware, async (req, res, next) => {
  try {
    const connection = await pool.getConnection();
    const [products] = await connection.query(
      `SELECT p.* FROM products p ORDER BY p.review_count DESC, p.rating DESC LIMIT 8`,
      []
    );
    connection.release();
    res.json({ data: products });
  } catch (error) {
    next(error);
  }
});

// Get categories — must be before /:id
router.get('/categories/list', async (req, res, next) => {
  try {
    const connection = await pool.getConnection();
    const [categories] = await connection.query(
      'SELECT id, name, slug, image_url FROM categories WHERE is_active = TRUE ORDER BY name',
      []
    );
    connection.release();
    res.json({ data: categories });
  } catch (error) {
    next(error);
  }
});

// Get single product — must be after all named routes
router.get('/:id', optionalAuthMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    const [products] = await connection.query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = ? AND p.is_active = TRUE`,
      [id]
    );

    if (products.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = products[0];

    const [variants] = await connection.query(
      'SELECT * FROM product_variants WHERE product_id = ? AND is_active = TRUE',
      [id]
    );

    const [reviews] = await connection.query(
      `SELECT r.*, u.first_name, u.last_name 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.product_id = ? AND r.is_approved = TRUE 
       ORDER BY r.created_at DESC LIMIT 10`,
      [id]
    );

    connection.release();

    res.json({
      product: {
        ...product,
        images: product.images ? JSON.parse(product.images) : [],
        specifications: product.specifications ? JSON.parse(product.specifications) : {},
        variants,
        reviews
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
