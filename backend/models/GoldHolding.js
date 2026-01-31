const mongoose = require('mongoose');

const goldHoldingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isDemo: {
      type: Boolean,
      default: false
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    metalType: {
      type: String,
      enum: ['gold', 'silver'],
      default: 'gold',
      index: true
    },
    goldAmount: {
      // grams of metal in this holding (kept as goldAmount for backward compatibility)
      type: Number,
      required: true,
      // Allow 0 only for fully sold holdings (we keep the document for history)
      min: 0
    },
    weightGrams: {
      type: Number,
      min: 0.01
    },
    karat: {
      type: Number,
      min: 0
    },
    purchasePricePerGram: {
      type: Number,
      required: true
    },
    purchaseTotalSAR: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['reserved', 'shipped', 'delivered', 'sold', 'cancelled'],
      default: 'reserved',
      index: true
    },
    storageType: {
      // where the bullion is held
      type: String,
      enum: ['vault', 'customer'],
      default: 'vault'
    },
    deliveryRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DeliveryRequest'
    }
  },
  { timestamps: true }
);

goldHoldingSchema.index({ userId: 1, status: 1, createdAt: -1 });
goldHoldingSchema.index({ userId: 1, metalType: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('GoldHolding', goldHoldingSchema);

