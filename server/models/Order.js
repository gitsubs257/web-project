const mongoose = require('mongoose');

// Snapshot of order item at time of purchase
const orderItemSchema = new mongoose.Schema({
  product:       { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name:          { type: String, required: true },
  image:         { type: String, default: '' },
  variantWeight: { type: String, required: true },
  price:         { type: Number, required: true },
  quantity:      { type: Number, required: true, min: 1 },
});

const addressSnapshotSchema = new mongoose.Schema({
  fullName: String,
  phone:    String,
  doorNo:   String,
  street:   String,
  area:     String,
  city:     String,
  state:    String,
  pincode:  String,
});

const statusHistorySchema = new mongoose.Schema({
  status:    { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
});

const cancellationRequestSchema = new mongoose.Schema({
  isRequested:  { type: Boolean, default: false },
  reason:       { type: String, default: '' },
  otherReason:  { type: String, default: '' },
  requestedAt:  { type: Date },
  status:       { type: String, enum: ['None', 'Pending', 'Approved', 'Rejected'], default: 'None' },
  adminComment: { type: String, default: '' },
  reviewedAt:   { type: Date },
});

const ORDER_STATUSES = [
  'Processing',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
  'Failed',
];

const orderSchema = new mongoose.Schema(
  {
    user:                { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items:               [orderItemSchema],
    shippingAddress:     addressSnapshotSchema,
    billingAddress:      addressSnapshotSchema,
    paymentMethod:       { type: String, default: 'COD' },
    couponCode:          { type: String, default: '' },
    discount:            { type: Number, default: 0 },
    subtotal:            { type: Number, required: true },
    deliveryCharge:      { type: Number, default: 0 },
    totalAmount:         { type: Number, required: true },
    status:              { type: String, enum: ORDER_STATUSES, default: 'Processing' },
    statusHistory:       [statusHistorySchema],
    cancellationRequest: { type: cancellationRequestSchema, default: () => ({ isRequested: false, status: 'None' }) },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
