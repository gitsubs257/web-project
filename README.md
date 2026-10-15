# Nethaji Tea Company - Web Application

A full-stack e-commerce web platform for **Nethaji Tea Company**, featuring product browsing with variant selection (weight/price), persistent cart, multi-address checkout, coupon discounts, order tracking, and a comprehensive admin management dashboard.

---

## 🍵 Features

- **Public & Customer Storefront**:
  - Browse tea products (Varam Tea, Top Rose Tea, Subash Tea, Masala Tea, Green Tea) with variant-based pricing (50g, 100g, 200g, 500g, 1kg).
  - Detailed product page with dynamic variant pricing, stock availability, and quantity selection.
  - Cart with real-time price calculations and server sync.
  - Multi-step checkout with delivery address management (Add / Edit / Set Default) and coupon code validation.
  - User order history with detailed order tracking (Pending, Processing, Shipped, Delivered, Cancelled).
  - Account profile management.

- **Admin Dashboard** (`/admin`):
  - Overview metrics: Total Revenue, Total Orders, Total Products, and recent orders.
  - Product Management: Add, edit, toggle visibility, and upload images for products with custom variant tiers.
  - Order Management: Filter orders by status and update order progression.
  - Coupon Management: Create and toggle discount coupons (percentage / flat discount, min order amount, max discount, expiry dates).

---

## 🚀 Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Axios, Custom CSS Design System
- **Backend**: Node.js, Express 4, Mongoose, JWT, Multer, bcryptjs
- **Database**: MongoDB (Local or MongoDB Atlas)

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** running locally on port `27017` or a MongoDB Atlas URI

### 2. Environment Configuration
Both `.env` files are configured:
- `server/.env`:
  ```env
  PORT=5000
  MONGO_URI=mongodb://localhost:27017/nethaji_tea
  JWT_SECRET=nethaji_tea_super_secret_jwt_key_2026_dev
  CLIENT_URL=http://localhost:5173

  ADMIN_EMAIL=admin@nethajitea.com
  ADMIN_PASSWORD=Admin@123
  ADMIN_FIRSTNAME=Nethaji
  ADMIN_LASTNAME=Admin
  ```
- `client/.env`:
  ```env
  VITE_API_URL=http://localhost:5000
  ```

### 3. Database Seeding
To populate initial tea catalog and default admin:
```bash
npm run seed:all
```

### 4. Running the Application

Open two terminals:

**Terminal 1 (Backend Server)**:
```bash
npm run server
# or for nodemon live-reload:
npm run server:dev
```
Backend runs on `http://localhost:5000`.

**Terminal 2 (Frontend Client)**:
```bash
npm run client
```
Frontend runs on `http://localhost:5173`.

---

## 🔐 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@nethajitea.com` | `Admin@123` |
| **Customer** | Register a new account via the `/register` page | Any strong password |
