# TechWholesale E-commerce Platform

A complete, production-ready e-commerce scaffold built with **Next.js**, **Node.js/Express**, and **MySQL**. Optimized for Hostinger deployment with full admin dashboard, checkout flow, and payment processing.

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Hostinger Deployment](#hostinger-deployment)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Database Schema](#database-schema)

## ✨ Features

### Frontend (Next.js)
- ✅ Responsive product catalog with advanced filtering
- ✅ Product detail pages with variants & reviews
- ✅ Shopping cart with localStorage persistence
- ✅ One-page progressive checkout flow
- ✅ User authentication (register/login)
- ✅ Account dashboard (orders, addresses, saved cards)
- ✅ Order tracking & history
- ✅ Guest checkout support
- ✅ Mobile-optimized design
- ✅ SEO-friendly structure

### Backend (Node.js + Express)
- ✅ RESTful API with JWT authentication
- ✅ Cart sync between frontend & server
- ✅ Mock payment processing with database persistence
- ✅ Order management & tracking
- ✅ Admin dashboard APIs
- ✅ Product CRUD operations
- ✅ Inventory tracking with logs
- ✅ User management & address book
- ✅ Rate limiting & security headers
- ✅ Database connection pooling

### Admin Features
- ✅ Dashboard with analytics
- ✅ Product management (CRUD)
- ✅ Order management & fulfillment
- ✅ Shipment tracking
- ✅ User management
- ✅ Revenue & sales analytics

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│      Next.js Frontend               │
│  (Client-side, SSR, Static Gen)     │
└────────────┬────────────────────────┘
             │ (REST API)
             │
┌────────────▼────────────────────────┐
│   Express.js API Server             │
│  (Routes, Controllers, Middleware)  │
└────────────┬────────────────────────┘
             │ (SQL Queries)
             │
┌────────────▼────────────────────────┐
│    MySQL Database                   │
│  (Users, Products, Orders, etc.)    │
└─────────────────────────────────────┘
```

## 📁 Project Structure

```
techwholesale-ecommerce/
├── api/                              # Backend (Node.js + Express)
│   ├── src/
│   │   ├── server.js                # Entry point
│   │   ├── config/
│   │   │   └── database.js          # MySQL connection pool
│   │   ├── routes/
│   │   │   ├── auth.js              # Authentication endpoints
│   │   │   ├── products.js          # Product catalog endpoints
│   │   │   ├── cart.js              # Cart management
│   │   │   ├── checkout.js          # Checkout & payment
│   │   │   ├── orders.js            # Order history
│   │   │   ├── users.js             # User profile & addresses
│   │   │   └── admin.js             # Admin endpoints
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT authentication
│   │   │   └── errorHandler.js      # Error handling
│   │   └── __tests__/
│   │       ├── auth.test.js         # Auth tests
│   │       └── checkout.test.js     # Checkout tests
│   └── package.json
│
├── web/                              # Frontend (Next.js)
│   ├── pages/
│   │   ├── index.js                 # Home page
│   │   ├── catalog.js               # Product catalog
│   │   ├── product/[id].js          # Product detail
│   │   ├── cart.js                  # Shopping cart
│   │   ├── checkout.js              # Checkout
│   │   ├── login.js                 # Login page
│   │   ├── register.js              # Registration
│   │   ├── account/
│   │   │   ├── index.js             # Account dashboard
│   │   │   ├── orders.js            # Order history
│   │   │   └── addresses.js         # Address book
│   │   ├── orders/[id].js           # Order tracking
│   │   └── admin/                   # Admin dashboard
│   ├── components/
│   │   ├── Header.js
│   │   ├── Footer.js
│   │   ├── ProductCard.js
│   │   └── ...
│   ├── styles/
│   │   ├── globals.css              # CSS variables & base styles
│   │   ├── Catalog.module.css
│   │   ├── Product.module.css
│   │   └── Checkout.module.css
│   ├── store/
│   │   ├── cartStore.js             # Zustand cart store
│   │   └── authStore.js             # Zustand auth store
│   ├── lib/
│   │   └── api.js                   # Axios with interceptors
│   └── package.json
│
├── database/
│   └── schema.sql                   # Complete MySQL schema
├── .env.example                      # Environment variables template
├── package.json                      # Root monorepo config
├── Procfile                          # Hostinger deployment config
└── README.md                         # This file
```

## 📦 Prerequisites

- **Node.js** 18+ & npm 9+
- **MySQL** 5.7+
- Git
- Hostinger account (for deployment)

## 🚀 Local Setup

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd techwholesale-ecommerce
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=techwholesale
DB_PORT=3306

# JWT
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# API URLs
API_URL=http://localhost:5000
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Setup Database

```bash
# Create database and tables
mysql -h localhost -u root -p < database/schema.sql

# Or via npm script
npm run setup:db
```

### 4. Start Development Servers

```bash
# Start both API (port 5000) and Frontend (port 3000) concurrently
npm run dev

# Or separately:
# Terminal 1:
npm run dev --workspace=api

# Terminal 2:
npm run dev --workspace=web
```

Access:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:5000/api
- **API Health Check**: http://localhost:5000/health

## 🌐 Hostinger Deployment

### Prerequisites
- Hostinger account with application hosting or VPS
- MySQL database provisioned in Hostinger panel
- SSH access to your Hostinger server

### Step 1: Prepare Hostinger Environment

1. Create MySQL database in Hostinger panel
2. Note down:
   - `HOSTINGER_MYSQL_HOST`
   - `HOSTINGER_MYSQL_USER`
   - `HOSTINGER_MYSQL_PASSWORD`
   - `HOSTINGER_MYSQL_DB`

### Step 2: Deploy Code

```bash
# From your local machine
git push origin main

# Or manually upload via SFTP/FTP
```

### Step 3: Configure Server Environment

SSH into your Hostinger server:

```bash
ssh user@your-hostinger-domain.com
cd /home/your-app-path
```

Create `.env` file:

```bash
cat > .env << EOF
NODE_ENV=production
PORT=5000

# Database
DB_HOST=$HOSTINGER_MYSQL_HOST
DB_USER=$HOSTINGER_MYSQL_USER
DB_PASSWORD=$HOSTINGER_MYSQL_PASSWORD
DB_NAME=$HOSTINGER_MYSQL_DB
DB_PORT=3306

# JWT
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# API URLs
API_URL=https://your-api-domain.com
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NEXT_PUBLIC_APP_URL=https://your-app-domain.com
EOF
```

### Step 4: Install & Build

```bash
# Install dependencies
npm install --production

# Build frontend
npm run build --workspace=web

# Setup database
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD < database/schema.sql
```

### Step 5: Configure Process Manager (PM2)

```bash
# Install PM2 globally
npm install -g pm2

# Create ecosystem config
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'techwholesale-api',
    script: './api/src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log'
  }]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 6: Configure Reverse Proxy (Nginx)

```bash
# Create Nginx config
sudo cat > /etc/nginx/sites-available/techwholesale << 'EOF'
# API Server
upstream api {
  server 127.0.0.1:5000;
}

server {
  listen 80;
  server_name api.your-domain.com;

  location / {
    proxy_pass http://api;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}

# Frontend Server (Optional - if using Hostinger's Node.js hosting)
server {
  listen 80;
  server_name www.your-domain.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/techwholesale /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 7: Setup SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.your-domain.com -d www.your-domain.com
sudo systemctl restart nginx
```

### Step 8: Verify Deployment

```bash
# Check API health
curl https://api.your-domain.com/health

# Check logs
pm2 logs

# Monitor
pm2 monit
```

## 📚 API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "first_name": "John",
  "last_name": "Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "customer"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Products

#### Get Products (with filtering)
```http
GET /api/products?search=phone&category=smartphones&sort=price_asc&minPrice=100&maxPrice=1000&page=1&limit=12
```

#### Get Product Detail
```http
GET /api/products/1
```

### Cart

#### Add to Cart
```http
POST /api/cart/items
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "product_id": 1,
  "quantity": 2,
  "variant_id": null
}
```

#### Get Cart
```http
GET /api/cart
Authorization: Bearer {accessToken}
```

### Checkout

#### Create Checkout Session
```http
POST /api/checkout/session
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "555-1234",
  "shipping_address": {
    "street_address": "123 Main St",
    "city": "San Francisco",
    "postal_code": "94102",
    "country": "United States"
  },
  "billing_address": {
    "street_address": "123 Main St",
    "city": "San Francisco",
    "postal_code": "94102",
    "country": "United States"
  }
}
```

#### Process Payment (Mock)
```http
POST /api/checkout/payment
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "sessionToken": "uuid-token",
  "payment_method": "credit_card",
  "card_number": "4111111111111111",
  "cvv": "123",
  "expiry": "12/25"
}
```

**Test Cards:**
- Valid: `4111111111111111`
- Declined: `4000000000000002`

### Orders

#### Get User Orders
```http
GET /api/orders?status=completed&page=1&limit=10
Authorization: Bearer {accessToken}
```

#### Get Order Detail
```http
GET /api/orders/1
Authorization: Bearer {accessToken}
```

#### Cancel Order
```http
POST /api/orders/1/cancel
Authorization: Bearer {accessToken}
```

### Admin

#### Dashboard Analytics
```http
GET /api/admin/analytics
Authorization: Bearer {admin-token}
```

#### Get Products (Admin)
```http
GET /api/admin/products?page=1&limit=20
Authorization: Bearer {admin-token}
```

#### Create Product
```http
POST /api/admin/products
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "category_id": 1,
  "sku": "SKU-001",
  "name": "Product Name",
  "slug": "product-name",
  "description": "Product description",
  "price": 99.99,
  "compare_at_price": 129.99,
  "quantity": 50,
  "is_featured": true,
  "specifications": {
    "color": "black",
    "storage": "256GB"
  }
}
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
npm run test:auth
npm run test:checkout
```

### Test Coverage
```bash
npm test -- --coverage
```

## 📊 Database Schema

### Core Tables
- **users** - User accounts & authentication
- **products** - Product catalog
- **categories** - Product categories
- **product_variants** - Product options (color, size, etc.)
- **carts** - Shopping carts
- **cart_items** - Items in cart
- **orders** - Customer orders
- **order_items** - Items in order
- **payments** - Payment records
- **shipments** - Order shipments & tracking
- **reviews** - Product reviews
- **addresses** - User shipping/billing addresses
- **saved_cards** - Saved payment methods
- **inventory_logs** - Inventory tracking history
- **refresh_tokens** - JWT refresh tokens

See `database/schema.sql` for complete schema with all fields and relationships.

## 🔒 Security Features

- ✅ JWT authentication with refresh tokens
- ✅ Password hashing with bcryptjs
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Security headers (Helmet.js)
- ✅ SQL injection prevention (parameterized queries)
- ✅ HTTPS enforcement in production
- ✅ Environment variables for sensitive data

## 📝 Environment Variables

See `.env.example` for all available variables. Key variables:

```
# Server
NODE_ENV=production|development
PORT=5000
API_URL=https://api.domain.com

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=techwholesale
DB_PORT=3306

# JWT
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Frontend
NEXT_PUBLIC_API_URL=https://api.domain.com/api
NEXT_PUBLIC_APP_URL=https://domain.com
```

## 🚨 Troubleshooting

### Database Connection Failed
- Check MySQL is running: `sudo systemctl status mysql`
- Verify credentials in `.env`
- Test connection: `mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -D $DB_NAME`

### CORS Errors
- Verify `NEXT_PUBLIC_API_URL` matches API server domain
- Check CORS configuration in `server.js`

### Payment Processing Fails
- Ensure cart has items
- Verify checkout session token is valid
- Check test card numbers in API docs

### PM2 Not Starting
- Check logs: `pm2 logs`
- Verify Node version: `node -v` (should be 18+)
- Reinstall PM2: `npm install -g pm2`

## 📞 Support

For issues or questions:
1. Check the README & API documentation
2. Review test files for usage examples
3. Check server logs: `pm2 logs` or application logs

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

This is a scaffold/template. Feel free to customize for your needs!

---

**Built with ❤️ for modern e-commerce**
