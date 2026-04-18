# E-commerce Scaffold - File Structure Guide

## Complete Directory Tree

```
techwholesale-ecommerce/
│
├── api/                                  # Backend - Node.js + Express
│   ├── src/
│   │   ├── server.js                    # Express app initialization
│   │   ├── config/
│   │   │   └── database.js              # MySQL connection pool setup
│   │   ├── routes/
│   │   │   ├── auth.js                  # JWT auth endpoints (register/login/refresh)
│   │   │   ├── products.js              # Product catalog with search/filter
│   │   │   ├── cart.js                  # Cart CRUD (add/remove/update items)
│   │   │   ├── checkout.js              # Checkout session & payment processing
│   │   │   ├── orders.js                # Order history & tracking
│   │   │   ├── users.js                 # User profiles, addresses, saved cards
│   │   │   └── admin.js                 # Admin dashboard & product management
│   │   ├── middleware/
│   │   │   ├── auth.js                  # JWT verification & role checks
│   │   │   └── errorHandler.js          # Global error handling
│   │   ├── utils/
│   │   │   └── (add-as-needed)
│   │   └── __tests__/
│   │       ├── auth.test.js             # Auth flow tests
│   │       └── checkout.test.js         # Payment & checkout tests
│   └── package.json                      # Dependencies for API
│
├── web/                                  # Frontend - Next.js + React
│   ├── pages/
│   │   ├── _app.js                      # App wrapper (auth hydration)
│   │   ├── _document.js                 # HTML document wrapper
│   │   ├── index.js                     # Home page (from index.html)
│   │   ├── catalog.js                   # Product listing with filters
│   │   ├── cart.js                      # Shopping cart page
│   │   ├── checkout.js                  # One-page checkout form
│   │   ├── login.js                     # Login page
│   │   ├── register.js                  # Registration page
│   │   ├── product/
│   │   │   └── [id].js                  # Product detail page
│   │   ├── orders/
│   │   │   └── [id].js                  # Order tracking page
│   │   ├── account/
│   │   │   ├── index.js                 # Account dashboard
│   │   │   ├── orders.js                # Order history
│   │   │   ├── addresses.js             # Address book
│   │   │   └── settings.js              # Account settings
│   │   ├── admin/                       # (Optional) Admin frontend
│   │   │   ├── index.js
│   │   │   ├── products.js
│   │   │   ├── orders.js
│   │   │   └── analytics.js
│   │   └── api/                         # API routes (optional for serverless)
│   │       └── (placeholder for Next.js API routes if needed)
│   │
│   ├── components/
│   │   ├── Header.js                    # Navigation header
│   │   ├── Footer.js                    # Footer component
│   │   ├── ProductCard.js               # Reusable product card
│   │   ├── CartItem.js                  # Cart item component
│   │   ├── CheckoutForm.js              # Checkout form component
│   │   ├── AuthForm.js                  # Login/Register form
│   │   └── ProtectedRoute.js            # Auth guard component
│   │
│   ├── styles/
│   │   ├── globals.css                  # Global CSS with design tokens
│   │   ├── Catalog.module.css           # Catalog page styles
│   │   ├── Product.module.css           # Product detail styles
│   │   ├── Checkout.module.css          # Checkout page styles
│   │   ├── Cart.module.css              # Cart page styles
│   │   └── Auth.module.css              # Auth pages styles
│   │
│   ├── store/
│   │   ├── cartStore.js                 # Zustand cart state (localStorage)
│   │   ├── authStore.js                 # Zustand auth state (localStorage)
│   │   └── useStore.js                  # Combined store export (optional)
│   │
│   ├── lib/
│   │   ├── api.js                       # Axios instance with interceptors
│   │   ├── helpers.js                   # Utility functions
│   │   └── constants.js                 # App constants
│   │
│   ├── public/
│   │   ├── favicon.ico
│   │   └── (static assets)
│   │
│   ├── next.config.js                   # Next.js configuration
│   ├── .eslintrc.json                   # ESLint config
│   └── package.json                     # Frontend dependencies
│
├── database/
│   ├── schema.sql                       # Complete MySQL schema
│   ├── seeds.sql                        # Sample data (optional)
│   └── migrations/                      # Database migrations (optional)
│       └── 001-initial-schema.sql
│
├── scripts/
│   ├── seedDatabase.js                  # Database seeding script
│   └── migrate.js                       # Database migration runner
│
├── .env.example                         # Environment variables template
├── .gitignore                           # Git ignore patterns
├── Procfile                             # Hostinger/Heroku deployment config
├── package.json                         # Root monorepo configuration
├── README.md                            # Complete documentation
└── LICENSE                              # MIT License
```

## File Descriptions

### Backend (api/)

#### config/database.js
- MySQL connection pool initialization
- Connection pooling with max 10 concurrent connections
- Automatic reconnect handling
- Environment-based configuration

#### routes/auth.js
- `POST /auth/register` - Create user account
- `POST /auth/login` - Authenticate and issue tokens
- `POST /auth/refresh` - Refresh expired access token
- `GET /auth/me` - Get current user (protected)
- `POST /auth/logout` - Invalidate refresh tokens

#### routes/products.js
- `GET /products` - List with pagination, search, filters
- `GET /products/[id]` - Product detail with variants & reviews
- `GET /products/featured` - Featured products
- `GET /products/trending` - Top selling products
- `GET /products/categories/list` - Category listing

#### routes/cart.js
- `GET /cart` - Fetch user's active cart
- `POST /cart/items` - Add product to cart
- `PATCH /cart/items/[id]` - Update item quantity
- `DELETE /cart/items/[id]` - Remove from cart
- `DELETE /cart` - Clear entire cart

#### routes/checkout.js
- `POST /checkout/session` - Create checkout session
- `POST /checkout/payment` - Process payment (mock)
- `GET /checkout/order/[id]` - Get order status
- Handles order creation, inventory updates, and payment recording

#### routes/orders.js
- `GET /orders` - User's order history with pagination
- `GET /orders/[id]` - Order detail with items & shipment
- `POST /orders/[id]/cancel` - Cancel pending order

#### routes/users.js
- `GET /users/profile` - Current user profile
- `PATCH /users/profile` - Update profile
- `GET /users/addresses` - List addresses
- `POST /users/addresses` - Add address
- `PATCH /users/addresses/[id]` - Update address
- `DELETE /users/addresses/[id]` - Delete address
- `GET /users/cards` - Saved payment methods
- `DELETE /users/cards/[id]` - Remove saved card

#### routes/admin.js
- `GET /admin/analytics` - Dashboard metrics
- `GET /admin/products` - Product listing (paginated)
- `POST /admin/products` - Create product
- `PATCH /admin/products/[id]` - Update product
- `DELETE /admin/products/[id]` - Delete product
- `GET /admin/orders` - All orders with filtering
- `PATCH /admin/orders/[id]` - Update order status
- `POST /admin/orders/[id]/shipment` - Create shipment

### Frontend (web/)

#### store/cartStore.js
- Zustand state management for shopping cart
- localStorage persistence
- Methods: addItem, removeItem, updateQuantity, fetchCart, clearCart
- Computed: getTotal(), getItemCount()

#### store/authStore.js
- Zustand state management for authentication
- localStorage persistence of tokens and user data
- Methods: register, login, logout, fetchUser, refreshAccessToken
- Automatic token refresh via interceptors

#### lib/api.js
- Axios instance with custom base URL
- Request interceptor: Auto-attach JWT tokens
- Response interceptor: Handle 401 errors & auto-refresh tokens
- CORS & JSON headers configured

#### pages/catalog.js
- Dynamic product filtering (search, category, price, sort)
- Pagination support
- URL-based state management
- Side-by-side layout (filters + grid)

#### pages/product/[id].js
- Product details with images gallery
- Variant selection dropdown
- Quantity picker
- Reviews section
- Add to cart functionality
- Stock status

#### pages/checkout.js
- 4-step progressive checkout:
  1. Shipping Information
  2. Billing Address
  3. Payment Method
  4. Order Confirmation
- Form validation at each step
- Order summary sidebar
- Mock payment processing
- Responsive layout

### Database (database/)

#### schema.sql
Complete MySQL schema with:
- **users** - Authentication & profiles
- **addresses** - Shipping/billing addresses
- **products** - Product catalog with pricing
- **product_variants** - Options (color, size, etc.)
- **categories** - Product categories
- **carts** - Shopping cart sessions
- **cart_items** - Items in cart
- **orders** - Customer orders
- **order_items** - Line items on orders
- **payments** - Payment records & transactions
- **shipments** - Order shipments & tracking
- **reviews** - Product reviews
- **saved_cards** - Payment methods
- **wishlists** - User favorites
- **coupons** - Discount codes
- **inventory_logs** - Inventory change tracking
- **analytics_events** - User activity tracking
- **refresh_tokens** - JWT token management

All tables include:
- Proper indexes for performance
- Foreign keys with cascading deletes
- Timestamps (created_at, updated_at)
- Appropriate data types & constraints
- Full-text search indexes where applicable

## Key Design Patterns

### State Management
- **Zustand** stores for client-side state
- localStorage persistence for cart & auth
- Server sync on login

### API Communication
- Centralized axios instance with interceptors
- Automatic token management
- Error handling with retry logic

### Authentication
- JWT with access + refresh token pattern
- Token refresh on 401 responses
- Logout clears tokens & redirects

### Database
- Connection pooling for performance
- Parameterized queries prevent SQL injection
- Transaction support for critical operations (checkout)

### Styling
- CSS Modules for component encapsulation
- CSS Custom Properties (variables) for theming
- Mobile-first responsive design

## Adding New Features

### Add New API Endpoint
1. Create route in `api/src/routes/[feature].js`
2. Add to imports in `api/src/server.js`
3. Write tests in `api/src/__tests__/[feature].test.js`
4. Document in README.md

### Add New Page
1. Create `web/pages/[page].js`
2. Import stores & components
3. Add CSS module `web/styles/[Page].module.css`
4. Update navigation if needed

### Update Database Schema
1. Backup current schema
2. Modify `database/schema.sql`
3. Create migration script in `database/migrations/`
4. Run migration on all environments

## Deployment Checklist

- [ ] Update `.env` with production values
- [ ] Set `NODE_ENV=production`
- [ ] Build frontend: `npm run build --workspace=web`
- [ ] Setup database: `npm run setup:db`
- [ ] Start with PM2: `pm2 start ecosystem.config.js`
- [ ] Configure Nginx reverse proxy
- [ ] Setup SSL certificate
- [ ] Configure domain DNS
- [ ] Test all major flows (signup, checkout, order)
- [ ] Monitor logs: `pm2 logs`
- [ ] Setup automated backups for database
