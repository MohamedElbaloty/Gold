const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isDemo: {
    type: Boolean,
    default: false
  },
  goldBalance: {
    type: Number,
    default: 0,
    min: 0 // Prevent negative balances
  },
  silverBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  sarBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  // Margin trading: locked margin for open leveraged positions
  marginLockedSAR: {
    type: Number,
    default: 0,
    min: 0
  },
  totalGoldBought: {
    type: Number,
    default: 0
  },
  totalGoldSold: {
    type: Number,
    default: 0
  },
  totalSilverBought: {
    type: Number,
    default: 0
  },
  totalSilverSold: {
    type: Number,
    default: 0
  },
  totalValueInSAR: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// One real + one demo wallet per user
walletSchema.index({ userId: 1, isDemo: 1 }, { unique: true });

module.exports = mongoose.model('Wallet', walletSchema);
