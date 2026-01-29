const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  instrument: {
    type: String,
    default: 'XAU_SAR' // gold vs SAR
  },
  side: {
    type: String,
    enum: ['long', 'short'],
    required: true
  },
  goldAmount: {
    type: Number,
    required: true,
    min: 0.01
  },
  leverage: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  openPriceSAR: {
    type: Number,
    required: true
  },
  openNotionalSAR: {
    type: Number,
    required: true
  },
  marginUsedSAR: {
    type: Number,
    required: true
  },
  priceSnapshotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PriceSnapshot'
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open',
    index: true
  },
  closePriceSAR: Number,
  closeNotionalSAR: Number,
  pnlSAR: Number,
  openedAt: {
    type: Date,
    default: Date.now
  },
  closedAt: Date
});

positionSchema.index({ userId: 1, status: 1, openedAt: -1 });

module.exports = mongoose.model('Position', positionSchema);

