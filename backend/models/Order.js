const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['buy', 'sell'],
    required: true
  },
  metalType: {
    type: String,
    enum: ['gold', 'silver'],
    default: 'gold',
    index: true
  },
  goldAmount: {
    type: Number,
    required: true,
    min: 0.01 // Minimum 0.01 grams
  },
  pricePerGram: {
    type: Number,
    required: true
  },
  totalSAR: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'executed', 'failed', 'cancelled'],
    default: 'pending'
  },
  executedAt: Date,
  priceSnapshotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PriceSnapshot'
  },
  // Audit trail
  executionDetails: {
    lockedPrice: Number,
    actualPrice: Number,
    spread: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, type: 1 });

module.exports = mongoose.model('Order', orderSchema);
