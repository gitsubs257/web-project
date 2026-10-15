const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  applyCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCoupon,
} = require('../controllers/couponController');

// User: apply coupon (requires login)
router.post('/apply', authMiddleware, applyCoupon);

// Admin CRUD
router.get('/', authMiddleware, adminMiddleware, getAllCoupons);
router.post('/', authMiddleware, adminMiddleware, createCoupon);
router.put('/:id', authMiddleware, adminMiddleware, updateCoupon);
router.delete('/:id', authMiddleware, adminMiddleware, deleteCoupon);
router.patch('/:id/toggle', authMiddleware, adminMiddleware, toggleCoupon);

module.exports = router;
