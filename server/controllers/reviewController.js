const mongoose = require('mongoose');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * Recomputes average rating and review count for a product
 */
const updateProductReviewStats = async (productId) => {
  try {
    const stats = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: '$product',
          numReviews: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
    ]);

    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        ratings: Math.round(stats[0].avgRating * 10) / 10,
        numReviews: stats[0].numReviews,
      });
    } else {
      await Product.findByIdAndUpdate(productId, {
        ratings: 0,
        numReviews: 0,
      });
    }
  } catch (error) {
    console.error('Error updating product review stats:', error);
  }
};

// ─── POST /api/products/:productId/reviews (Customer: Delivered Order Only) ─
const createOrUpdateReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment, orderId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // 1. Strict verification: Customer must have this product in an order with status 'Delivered'
    const deliveredQuery = {
      user: req.user._id,
      status: 'Delivered',
      'items.product': productId,
    };
    if (orderId) {
      deliveredQuery._id = orderId;
    }

    const deliveredOrder = await Order.findOne(deliveredQuery);

    if (!deliveredOrder) {
      return res.status(403).json({
        message: 'You can only review products from orders that have been successfully delivered to you.',
      });
    }

    // 2. Validate input
    const parsedRating = Number(rating);
    if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ message: 'Please select a valid rating between 1 and 5 stars' });
    }
    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: 'Please write a brief comment describing your experience' });
    }

    // 3. Check for existing review by this user on this product
    let review = await Review.findOne({ user: req.user._id, product: productId });
    let isUpdate = false;

    if (review) {
      isUpdate = true;
      review.rating = parsedRating;
      review.title = title ? title.trim() : '';
      review.comment = comment.trim();
      review.order = deliveredOrder._id;
      review.isVerifiedPurchase = true;
      await review.save();
    } else {
      review = await Review.create({
        user: req.user._id,
        product: productId,
        order: deliveredOrder._id,
        rating: parsedRating,
        title: title ? title.trim() : '',
        comment: comment.trim(),
        isVerifiedPurchase: true,
      });
    }

    await updateProductReviewStats(productId);

    // Return populated review
    const populated = await Review.findById(review._id).populate('user', 'firstName lastName');

    res.status(isUpdate ? 200 : 201).json({
      message: isUpdate ? 'Review updated successfully!' : 'Thank you for your review!',
      review: populated,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── GET /api/products/:productId/reviews (Public) ───────────────────────────
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId })
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 });

    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;

    reviews.forEach((r) => {
      if (ratingCounts[r.rating] !== undefined) {
        ratingCounts[r.rating]++;
      }
      sum += r.rating;
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 ? Math.round((sum / totalReviews) * 10) / 10 : 0;

    res.json({
      reviews,
      totalReviews,
      averageRating,
      ratingCounts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── GET /api/products/:productId/review-eligibility (Customer) ──────────────
const checkReviewEligibility = async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if user has any delivered order containing this product
    const deliveredOrder = await Order.findOne({
      user: req.user._id,
      status: 'Delivered',
      'items.product': productId,
    }).sort({ createdAt: -1 });

    const existingReview = await Review.findOne({
      user: req.user._id,
      product: productId,
    });

    res.json({
      canReview: Boolean(deliveredOrder),
      hasDeliveredOrder: Boolean(deliveredOrder),
      deliveredOrderId: deliveredOrder ? deliveredOrder._id : null,
      existingReview,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── GET /api/products/reviews/my (Customer: All my submitted reviews) ────────
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('product', 'name image category')
      .sort({ updatedAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── DELETE /api/products/:productId/reviews/:reviewId (Owner / Admin) ───────
const deleteReview = async (req, res) => {
  try {
    const { reviewId, productId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to delete this review' });
    }

    await review.deleteOne();
    await updateProductReviewStats(productId || review.product);

    res.json({ message: 'Review removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createOrUpdateReview,
  getProductReviews,
  checkReviewEligibility,
  getMyReviews,
  deleteReview,
};
