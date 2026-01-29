const mongoose = require('mongoose');

const priceSnapshotSchema = new mongoose.Schema({
  // Gold (per gram)
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

  // Silver (per gram) - optional for backward compatibility
  silverSpotPriceUSD: { type: Number, required: false },
  silverSpotPriceSAR: { type: Number, required: false },
  silverBuyPriceSAR: { type: Number, required: false },
  silverSellPriceSAR: { type: Number, required: false },

  // Platinum (per gram) - optional for backward compatibility
  platinumSpotPriceUSD: { type: Number, required: false },
  platinumSpotPriceSAR: { type: Number, required: false },
  platinumBuyPriceSAR: { type: Number, required: false },
  platinumSellPriceSAR: { type: Number, required: false },

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
