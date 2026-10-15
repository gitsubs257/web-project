const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
  requestOrderCancellation,
  getCancellationRequests,
  reviewCancellationRequest,
} = require('../controllers/orderController');

// User routes
router.post('/', authMiddleware, createOrder);
router.get('/my', authMiddleware, getMyOrders);
router.post('/:id/cancel-request', authMiddleware, requestOrderCancellation);

// Admin routes
router.get('/stats', authMiddleware, adminMiddleware, getOrderStats);
router.get('/all', authMiddleware, adminMiddleware, getAllOrders);
router.get('/cancellations', authMiddleware, adminMiddleware, getCancellationRequests);
router.put('/:id/review-cancellation', authMiddleware, adminMiddleware, reviewCancellationRequest);
router.put('/:id/status', authMiddleware, adminMiddleware, updateOrderStatus);

// Param route (keep at bottom)
router.get('/:id', authMiddleware, getOrderById);

module.exports = router;
