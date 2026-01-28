const mongoose = require('mongoose');

const deliveryRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  goldAmount: {
    type: Number,
    required: true,
    min: 0
  },
  weight: {
    type: String,
    enum: ['10g', '50g', '100g', '1kg'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  deliveryAddress: {
    street: String,
    city: String,
    postalCode: String,
    country: {
      type: String,
      default: 'Saudi Arabia'
    }
  },
  contactPhone: String,
  trackingNumber: String,
  // Merchant updates
  merchantNotes: String,
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: Date,
  shippedAt: Date,
  deliveredAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
deliveryRequestSchema.index({ userId: 1, createdAt: -1 });
deliveryRequestSchema.index({ status: 1 });

module.exports = mongoose.model('DeliveryRequest', deliveryRequestSchema);
