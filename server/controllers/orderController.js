const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// ─── POST /api/orders ─────────────────────────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    const {
      items,           // Array of { productId, variantWeight, quantity }
      shippingAddress,
      billingAddress,
      paymentMethod,
      couponCode,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }
    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    // Build order items and compute subtotal
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: `Product ${item.productId} not found` });

      const variant = product.variants.find((v) => v.weight === item.variantWeight);
      if (!variant) return res.status(404).json({ message: `Variant ${item.variantWeight} not found` });
      if (variant.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name} (${item.variantWeight})` });
      }

      const lineTotal = variant.price * item.quantity;
      subtotal += lineTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        variantWeight: item.variantWeight,
        price: variant.price,
        quantity: item.quantity,
      });
    }

    // Apply coupon
    let discount = 0;
    let appliedCoupon = '';
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && new Date(coupon.expiryDate) >= new Date() && subtotal >= coupon.minOrderValue) {
        appliedCoupon = coupon.code;
        discount =
          coupon.discountType === 'percent'
            ? (subtotal * coupon.discountValue) / 100
            : coupon.discountValue;
        discount = Math.min(discount, subtotal); // cap at subtotal
      }
    }

    const deliveryCharge = 0; // free delivery for now
    const totalAmount = subtotal - discount + deliveryCharge;

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      couponCode: appliedCoupon,
      discount,
      subtotal,
      deliveryCharge,
      totalAmount,
      status: 'Processing',
      statusHistory: [{ status: 'Processing', updatedAt: new Date() }],
    });

    // Reduce stock for each ordered item
    for (const item of items) {
      await Product.findOneAndUpdate(
        { _id: item.productId, 'variants.weight': item.variantWeight },
        { $inc: { 'variants.$.stock': -item.quantity } }
      );
    }

    // Remove ordered items from the user's cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = cart.items.filter((cartItem) => {
        return !items.some(
          (orderedItem) =>
            cartItem.product.toString() === orderedItem.productId &&
            cartItem.variantWeight === orderedItem.variantWeight
        );
      });
      await cart.save();
    }

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── GET /api/orders/my ───────────────────────────────────────────────────────
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── GET /api/orders/:id ──────────────────────────────────────────────────────
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    // Only owner or admin can view
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── GET /api/orders (admin) ──────────────────────────────────────────────────
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'firstName lastName email phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── PUT /api/orders/:id/status (admin) ───────────────────────────────────────
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    order.statusHistory.push({ status, updatedAt: new Date() });
    await order.save();

    res.json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── POST /api/orders/:id/cancel-request (customer) ─────────────────────────
const requestOrderCancellation = async (req, res) => {
  try {
    const { reason, otherReason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Please select a reason for cancellation' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Verify ownership
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Check if order is in a cancellable state
    if (['Out for Delivery', 'Delivered', 'Cancelled', 'Failed'].includes(order.status)) {
      return res.status(400).json({
        message: `Order cannot be cancelled because it is already "${order.status}".`,
      });
    }

    if (order.cancellationRequest?.status === 'Pending') {
      return res.status(400).json({ message: 'A cancellation request is already pending review for this order' });
    }

    order.cancellationRequest = {
      isRequested: true,
      reason: reason.trim(),
      otherReason: otherReason ? otherReason.trim() : '',
      requestedAt: new Date(),
      status: 'Pending',
      adminComment: '',
      reviewedAt: null,
    };

    order.statusHistory.push({
      status: `Cancellation Requested (${reason.trim()})`,
      updatedAt: new Date(),
    });

    await order.save();
    res.json({ message: 'Cancellation request submitted to admin', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── GET /api/orders/cancellations (admin: separated cancellation space) ────────
const getCancellationRequests = async (req, res) => {
  try {
    const orders = await Order.find({ 'cancellationRequest.isRequested': true })
      .populate('user', 'firstName lastName email phone')
      .sort({ 'cancellationRequest.requestedAt': -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── PUT /api/orders/:id/review-cancellation (admin) ──────────────────────────
const reviewCancellationRequest = async (req, res) => {
  try {
    const { action, comment } = req.body; // action: 'approve' or 'reject'
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Action must be "approve" or "reject"' });
    }

    const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (!order.cancellationRequest || !order.cancellationRequest.isRequested) {
      return res.status(400).json({ message: 'No cancellation request found for this order' });
    }

    if (action === 'approve') {
      order.status = 'Cancelled';
      order.cancellationRequest.status = 'Approved';
      order.cancellationRequest.adminComment = comment ? comment.trim() : 'Approved by admin';
      order.cancellationRequest.reviewedAt = new Date();
      order.statusHistory.push({ status: 'Cancelled (Request Approved)', updatedAt: new Date() });

      // Restock items
      for (const item of order.items) {
        if (item.product) {
          await Product.updateOne(
            { _id: item.product, 'variants.weight': item.variantWeight },
            { $inc: { 'variants.$.stock': item.quantity } }
          );
        }
      }
    } else {
      order.cancellationRequest.status = 'Rejected';
      order.cancellationRequest.adminComment = comment ? comment.trim() : 'Rejected by admin';
      order.cancellationRequest.reviewedAt = new Date();
      order.statusHistory.push({ status: 'Cancellation Request Rejected', updatedAt: new Date() });
    }

    await order.save();
    res.json({
      message: `Cancellation request ${action === 'approve' ? 'approved and order cancelled' : 'rejected'}`,
      order,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── GET /api/orders/stats (admin dashboard) ──────────────────────────────────
const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingCancellations = await Order.countDocuments({ 'cancellationRequest.status': 'Pending' });
    const recentOrders = await Order.find()
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(5);
    res.json({ totalOrders, pendingCancellations, recentOrders });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
  requestOrderCancellation,
  getCancellationRequests,
  reviewCancellationRequest,
};
