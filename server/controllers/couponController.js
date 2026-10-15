const Coupon = require('../models/Coupon');

// ─── POST /api/coupons/apply ──────────────────────────────────────────────────
const applyCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    if (!code) return res.status(400).json({ message: 'Coupon code is required' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

    if (!coupon) return res.status(404).json({ message: 'Invalid coupon code' });
    if (!coupon.isActive) return res.status(400).json({ message: 'This coupon is no longer active' });
    if (new Date(coupon.expiryDate) < new Date()) return res.status(400).json({ message: 'This coupon has expired' });
    if (orderAmount < coupon.minOrderValue) {
      return res.status(400).json({
        message: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon`,
      });
    }

    const discount =
      coupon.discountType === 'percent'
        ? Math.min((orderAmount * coupon.discountValue) / 100, orderAmount)
        : Math.min(coupon.discountValue, orderAmount);

    res.json({
      message: 'Coupon applied successfully',
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── GET /api/coupons (admin) ─────────────────────────────────────────────────
const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── POST /api/coupons (admin) ────────────────────────────────────────────────
const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderValue, expiryDate, isActive } = req.body;
    if (!code || !discountType || !discountValue || !expiryDate) {
      return res.status(400).json({ message: 'code, discountType, discountValue, and expiryDate are required' });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (existing) return res.status(409).json({ message: 'Coupon code already exists' });

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      discountType,
      discountValue,
      minOrderValue: minOrderValue || 0,
      expiryDate,
      isActive: isActive !== false,
    });

    res.status(201).json({ message: 'Coupon created', coupon });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── PUT /api/coupons/:id (admin) ─────────────────────────────────────────────
const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

    Object.assign(coupon, req.body);
    if (req.body.code) coupon.code = req.body.code.toUpperCase().trim();
    await coupon.save();
    res.json({ message: 'Coupon updated', coupon });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── DELETE /api/coupons/:id (admin) ──────────────────────────────────────────
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    await coupon.deleteOne();
    res.json({ message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── PATCH /api/coupons/:id/toggle (admin) ────────────────────────────────────
const toggleCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    res.json({ message: `Coupon ${coupon.isActive ? 'enabled' : 'disabled'}`, coupon });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { applyCoupon, getAllCoupons, createCoupon, updateCoupon, deleteCoupon, toggleCoupon };
