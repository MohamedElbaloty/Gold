const mongoose = require('mongoose');

const priceSnapshotSchema = new mongoose.Schema({
  spotPriceUSD: {
    type: Number,
    required: true
  },
  spotPriceSAR: {
    type: Number,
    required: true
  },
  buyPriceSAR: {
    type: Number,
    required: true
  },
  sellPriceSAR: {
    type: Number,
    required: true
  },
  spread: {
    type: Number,
    required: true
  },
  usdToSarRate: {
    type: Number,
    required: true
  },
  source: {
    type: String,
    default: 'api'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for time-based queries
priceSnapshotSchema.index({ timestamp: -1 });

module.exports = mongoose.model('PriceSnapshot', priceSnapshotSchema);
