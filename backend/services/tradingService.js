const mongoose = require('mongoose');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const MerchantSettings = require('../models/MerchantSettings');
const { getCurrentPrices } = require('./pricingService');

// Execute buy order
async function executeBuyOrder(userId, goldAmount) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate amount
    const settings = await MerchantSettings.getSettings();
    if (goldAmount < settings.minTradeAmount || goldAmount > settings.maxTradeAmount) {
      throw new Error(`Trade amount must be between ${settings.minTradeAmount} and ${settings.maxTradeAmount} grams`);
    }

    // Get current prices
    const prices = await getCurrentPrices();
    const totalSAR = goldAmount * prices.buyPriceSAR;

    // Get or create wallet
    let wallet = await Wallet.findOne({ userId }).session(session);
    if (!wallet) {
      wallet = await Wallet.create([{ userId }], { session });
      wallet = wallet[0];
    }

    // Check if user has enough SAR balance
    if (wallet.sarBalance < totalSAR) {
      throw new Error('Insufficient SAR balance');
    }

    // Record balances before
    const balanceBefore = {
      goldBalance: wallet.goldBalance,
      sarBalance: wallet.sarBalance
    };

    // Update wallet
    wallet.sarBalance -= totalSAR;
    wallet.goldBalance += goldAmount;
    wallet.totalGoldBought += goldAmount;
    wallet.totalValueInSAR = wallet.goldBalance * prices.buyPriceSAR;
    wallet.lastUpdated = new Date();
    await wallet.save({ session });

    // Create order
    const order = await Order.create([{
      userId,
      type: 'buy',
      goldAmount,
      pricePerGram: prices.buyPriceSAR,
      totalSAR,
      status: 'executed',
      executedAt: new Date(),
      priceSnapshotId: prices.snapshotId,
      executionDetails: {
        lockedPrice: prices.buyPriceSAR,
        actualPrice: prices.buyPriceSAR,
        spread: prices.spread
      }
    }], { session });

    // Create transaction
    await Transaction.create([{
      userId,
      type: 'buy',
      orderId: order[0]._id,
      goldAmount,
      sarAmount: totalSAR,
      pricePerGram: prices.buyPriceSAR,
      status: 'completed',
      balanceBefore,
      balanceAfter: {
        goldBalance: wallet.goldBalance,
        sarBalance: wallet.sarBalance
      }
    }], { session });

    await session.commitTransaction();
    
    return {
      order: order[0],
      newBalance: {
        goldBalance: wallet.goldBalance,
        sarBalance: wallet.sarBalance
      }
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

// Execute sell order
async function executeSellOrder(userId, goldAmount) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate amount
    const settings = await MerchantSettings.getSettings();
    if (goldAmount < settings.minTradeAmount || goldAmount > settings.maxTradeAmount) {
      throw new Error(`Trade amount must be between ${settings.minTradeAmount} and ${settings.maxTradeAmount} grams`);
    }

    // Get current prices
    const prices = await getCurrentPrices();
    const totalSAR = goldAmount * prices.sellPriceSAR;

    // Get wallet
    const wallet = await Wallet.findOne({ userId }).session(session);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // Check if user has enough gold balance
    if (wallet.goldBalance < goldAmount) {
      throw new Error('Insufficient gold balance');
    }

    // Record balances before
    const balanceBefore = {
      goldBalance: wallet.goldBalance,
      sarBalance: wallet.sarBalance
    };

    // Update wallet
    wallet.goldBalance -= goldAmount;
    wallet.sarBalance += totalSAR;
    wallet.totalGoldSold += goldAmount;
    wallet.totalValueInSAR = wallet.goldBalance * prices.buyPriceSAR;
    wallet.lastUpdated = new Date();
    await wallet.save({ session });

    // Create order
    const order = await Order.create([{
      userId,
      type: 'sell',
      goldAmount,
      pricePerGram: prices.sellPriceSAR,
      totalSAR,
      status: 'executed',
      executedAt: new Date(),
      priceSnapshotId: prices.snapshotId,
      executionDetails: {
        lockedPrice: prices.sellPriceSAR,
        actualPrice: prices.sellPriceSAR,
        spread: prices.spread
      }
    }], { session });

    // Create transaction
    await Transaction.create([{
      userId,
      type: 'sell',
      orderId: order[0]._id,
      goldAmount,
      sarAmount: totalSAR,
      pricePerGram: prices.sellPriceSAR,
      status: 'completed',
      balanceBefore,
      balanceAfter: {
        goldBalance: wallet.goldBalance,
        sarBalance: wallet.sarBalance
      }
    }], { session });

    await session.commitTransaction();
    
    return {
      order: order[0],
      newBalance: {
        goldBalance: wallet.goldBalance,
        sarBalance: wallet.sarBalance
      }
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

module.exports = {
  executeBuyOrder,
  executeSellOrder
};
