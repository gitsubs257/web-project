const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  getProducts,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const {
  createOrUpdateReview,
  getProductReviews,
  checkReviewEligibility,
  getMyReviews,
  deleteReview,
} = require('../controllers/reviewController');

// Customer review routes
router.get('/reviews/my', authMiddleware, getMyReviews);
router.get('/:productId/reviews', getProductReviews);
router.get('/:productId/review-eligibility', authMiddleware, checkReviewEligibility);
router.post('/:productId/reviews', authMiddleware, createOrUpdateReview);
router.delete('/:productId/reviews/:reviewId', authMiddleware, deleteReview);

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin-only routes
router.get('/admin/all', authMiddleware, adminMiddleware, getAllProducts);
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), createProduct);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);

module.exports = router;
