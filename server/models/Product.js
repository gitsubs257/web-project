const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  weight: { type: String, required: true }, // e.g. "1kg", "500g"
  price:  { type: Number, required: true, min: 0 },
  stock:  { type: Number, required: true, min: 0, default: 0 },
});

const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    // image stores the relative path served by /uploads (e.g. "uploads/product-xxx.jpg")
    // Leave empty string '' — admin can upload via the dashboard
    image:       { type: String, default: '' },
    category:    { type: String, default: 'Tea' },
    variants:    [variantSchema],
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
