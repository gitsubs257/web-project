const Cart = require('../models/Cart');
const Product = require('../models/Product');

// ─── GET /api/cart ────────────────────────────────────────────────────────────
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) return res.json({ items: [] });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── POST /api/cart ───────────────────────────────────────────────────────────
// Add item or increase quantity if already in cart
const addToCart = async (req, res) => {
  try {
    const { productId, variantWeight, quantity = 1 } = req.body;
    if (!productId || !variantWeight) {
      return res.status(400).json({ message: 'productId and variantWeight are required' });
    }

    // Verify product and variant exist
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const variant = product.variants.find((v) => v.weight === variantWeight);
    if (!variant) return res.status(404).json({ message: 'Variant not found' });
    if (variant.stock < 1) return res.status(400).json({ message: 'Out of stock' });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if same product + variant already in cart
    const existingIdx = cart.items.findIndex(
      (i) => i.product.toString() === productId && i.variantWeight === variantWeight
    );

    if (existingIdx > -1) {
      cart.items[existingIdx].quantity += quantity;
    } else {
      cart.items.push({ product: productId, variantWeight, quantity });
    }

    await cart.save();
    const populated = await cart.populate('items.product');
    res.json({ message: 'Item added to cart', cart: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── PUT /api/cart/:itemId ────────────────────────────────────────────────────
// Update quantity of a specific cart item
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Cart item not found' });

    item.quantity = quantity;
    await cart.save();
    const populated = await cart.populate('items.product');
    res.json({ message: 'Cart updated', cart: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── DELETE /api/cart/:itemId ─────────────────────────────────────────────────
const removeCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Cart item not found' });

    item.deleteOne();
    await cart.save();
    const populated = await cart.populate('items.product');
    res.json({ message: 'Item removed', cart: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── DELETE /api/cart ─────────────────────────────────────────────────────────
// Clear entire cart (used after checkout)
const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
