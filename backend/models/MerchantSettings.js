const mongoose = require('mongoose');

const merchantSettingsSchema = new mongoose.Schema({
  spread: {
    type: Number,
    default: 0.02, // 2% spread (1% on each side)
    min: 0,
    max: 0.1 // Max 10% spread
  },
  buyMarkup: {
    type: Number,
    default: 0.01, // 1% markup on buy
    min: 0
  },
  sellMarkup: {
    type: Number,
    default: 0.01, // 1% markup on sell
    min: 0
  },
  minTradeAmount: {
    type: Number,
    default: 0.01, // Minimum 0.01 grams
    min: 0
  },
  maxTradeAmount: {
    type: Number,
    default: 10000, // Maximum 10kg per trade
    min: 0
  },
  // Margin trading configuration
  maxLeverage: {
    type: Number,
    default: 20, // e.g. max 1:20 leverage
    min: 1,
    max: 100
  },
  defaultLeverage: {
    type: Number,
    default: 5
  },
  contractSizeGrams: {
    type: Number,
    default: 1 // lot size in grams (e.g. 1g, 10g, 100g)
  },
  // Risk controls
  totalExposure: {
    type: Number,
    default: 0
  },
  maxExposure: {
    type: Number,
    default: 1000000 // 1M SAR max exposure
  },
  // Pricing source
  priceUpdateInterval: {
    type: Number,
    default: 30 // seconds
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Singleton pattern - only one settings document
merchantSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('MerchantSettings', merchantSettingsSchema);
