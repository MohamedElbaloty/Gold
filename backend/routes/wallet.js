const express = require('express');
const { authenticate } = require('../middleware/auth');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const router = express.Router();

// Get wallet balance
router.get('/balance', authenticate, async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.user._id });
    
    if (!wallet) {
      wallet = await Wallet.create({ userId: req.user._id });
    }

    res.json(wallet);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get transaction history
router.get('/transactions', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('orderId', 'type goldAmount pricePerGram');

    const total = await Transaction.countDocuments({ userId: req.user._id });

    res.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Deposit SAR (for testing - in production, integrate with payment gateway)
router.post('/deposit', authenticate, [
  require('express-validator').body('amount').isFloat({ min: 0.01 })
], async (req, res) => {
  try {
    const { amount } = req.body;
    const session = await require('mongoose').startSession();
    session.startTransaction();

    try {
      let wallet = await Wallet.findOne({ userId: req.user._id }).session(session);
      if (!wallet) {
        wallet = await Wallet.create([{ userId: req.user._id }], { session });
        wallet = wallet[0];
      }

      const balanceBefore = {
        goldBalance: wallet.goldBalance,
        sarBalance: wallet.sarBalance
      };

      wallet.sarBalance += parseFloat(amount);
      wallet.lastUpdated = new Date();
      await wallet.save({ session });

      await Transaction.create([{
        userId: req.user._id,
        type: 'deposit',
        goldAmount: 0,
        sarAmount: parseFloat(amount),
        pricePerGram: 0,
        status: 'completed',
        balanceBefore,
        balanceAfter: {
          goldBalance: wallet.goldBalance,
          sarBalance: wallet.sarBalance
        }
      }], { session });

      await session.commitTransaction();
      res.json({ message: 'Deposit successful', wallet });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
