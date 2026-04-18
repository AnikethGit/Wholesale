# Quick Start Guide

Get up and running in 5 minutes.

## Prerequisites Check

```bash
node --version  # Should be v18+
npm --version   # Should be v9+
mysql --version # Should be 5.7+
```

## 1️⃣ Clone & Install

```bash
git clone <repository>
cd techwholesale-ecommerce
npm install
```

## 2️⃣ Database Setup

### Option A: Local MySQL

```bash
# Create database and import schema
mysql -u root -p < database/schema.sql

# Or with password in command (less secure)
mysql -u root -pYourPassword < database/schema.sql
```

### Option B: Docker (Recommended)

```bash
# Start MySQL in Docker
docker run --name techwholesale-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=techwholesale \
  -p 3306:3306 \
  -d mysql:8

# Wait a few seconds, then import schema
mysql -h 127.0.0.1 -u root -prootpass < database/schema.sql
```

## 3️⃣ Environment Configuration

```bash
# Copy template
cp .env.example .env.local

# Edit with your values (or use defaults for local dev)
# Default values work for local development:
# - DB_HOST=localhost, DB_USER=root, DB_PASSWORD=''
```

## 4️⃣ Start Development

```bash
# Terminal 1: Start both servers concurrently
npm run dev

# OR start separately:
# Terminal 1:
npm run dev --workspace=api    # Runs on http://localhost:5000

# Terminal 2:
npm run dev --workspace=web    # Runs on http://localhost:3000
```

## 5️⃣ Verify It Works

### Test Frontend
```bash
open http://localhost:3000
# or
curl http://localhost:3000
```

### Test API
```bash
curl http://localhost:5000/health
# Should respond with {"status":"OK",...}
```

### Test Database
```bash
mysql -u root -p techwholesale
> SELECT COUNT(*) as product_count FROM products;
```

## 📝 Common Tasks

### Create Test User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"Test@1234",
    "first_name":"Test",
    "last_name":"User"
  }'
```

### Add Test Product

```bash
# First, login to get token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"admin@techwholesale.com",
    "password":"admin123"
  }' | jq -r '.accessToken')

# Create product
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": 1,
    "sku": "TEST-001",
    "name": "Test Product",
    "slug": "test-product",
    "price": 99.99,
    "quantity": 100,
    "description": "A test product"
  }'
```

### Run Tests

```bash
# All tests
npm test

# Specific test suite
npm run test:auth
npm run test:checkout

# Watch mode
npm test -- --watch
```

### Check Logs

```bash
# Backend logs (from dev terminal)
# Should see: "✅ Server running on http://localhost:5000"

# Database logs (if using Docker)
docker logs techwholesale-mysql
```

## 🔍 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5000
lsof -ti :5000 | xargs kill -9

# Kill process on port 3000
lsof -ti :3000 | xargs kill -9

# Or change ports in .env
PORT=5001  # API
```

### Database Connection Failed

```bash
# Check MySQL is running
sudo systemctl status mysql

# Or if using Docker
docker ps | grep mysql

# Test connection
mysql -h localhost -u root -p
```

### "Cannot find module" Error

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use (Alternative)

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac
sudo lsof -ti:5000 | xargs kill -9
```

## 📁 Project Layout

```
api/          ← Backend API
web/          ← Frontend Next.js app
database/     ← Database schema
.env.local    ← Your environment variables
```

## 🎯 Next Steps

1. **Browse the code**: Start with `web/pages/index.js` and `api/src/routes/auth.js`
2. **Play with the app**: 
   - Register new user at http://localhost:3000/register
   - Browse products at http://localhost:3000/catalog
   - Add to cart and checkout
3. **Explore admin**: Create admin user and test admin endpoints
4. **Read the docs**: See README.md and FILE_STRUCTURE.md for more info

## 🚀 Production Deployment

When ready to deploy to Hostinger:

```bash
# 1. Build frontend
npm run build --workspace=web

# 2. Setup .env with production values
cat > .env << EOF
NODE_ENV=production
PORT=5000
DB_HOST=hostinger-mysql-host
DB_USER=hostinger-user
DB_PASSWORD=your-password
JWT_SECRET=$(openssl rand -base64 32)
# ... other vars
EOF

# 3. Install production dependencies
npm install --production

# 4. Setup database
npm run setup:db

# 5. Use PM2 to manage process
npm install -g pm2
pm2 start api/src/server.js --name "techwholesale-api"
pm2 save
pm2 startup
```

## 📚 Learning Resources

- **Next.js**: https://nextjs.org/docs
- **Express**: https://expressjs.com/
- **MySQL**: https://dev.mysql.com/doc/
- **Zustand**: https://github.com/pmndrs/zustand
- **Axios**: https://axios-http.com/

## 💡 Tips

- Use `npm run lint` to check code quality
- Use `npm run format` to auto-format code
- Check logs in browser console and server terminal
- Use `curl` or Postman to test API endpoints
- Use browser DevTools to inspect network requests

## ❓ Need Help?

1. Check error messages in terminal
2. Review logs in browser console (F12 → Console)
3. Check database with: `mysql -u root -p techwholesale`
4. Compare your code with the examples in this repo
5. Review API documentation in README.md

---

**You're all set! 🎉**

Start coding and building amazing features!
