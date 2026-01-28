const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  goldBalance: {
    type: Number,
    default: 0,
    min: 0 // Prevent negative balances
  },
  sarBalance: {
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

// Index for faster queries
walletSchema.index({ userId: 1 });

module.exports = mongoose.model('Wallet', walletSchema);
