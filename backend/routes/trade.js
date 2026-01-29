const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { executeBuyOrder, executeSellOrder } = require('../services/tradingService');
const GoldHolding = require('../models/GoldHolding');
const router = express.Router();

// Buy gold — mode: query/body/header 'demo' | 'real' (default real)
router.post('/buy', authenticate, [
  body('goldAmount').exists().withMessage('Gold amount is required')
], async (req, res) => {
  try {
    const goldAmount = parseFloat(req.body.goldAmount);
    if (isNaN(goldAmount) || goldAmount < 0.01) {
      return res.status(400).json({ message: 'Gold amount must be at least 0.01 grams' });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array().map((e) => e.msg).join(' ') || 'Validation failed' });
    }

    const mode = (req.body.mode || req.query.mode || req.headers['x-account-mode'] || 'real').toLowerCase();
    const isDemo = mode === 'demo';

    const result = await executeBuyOrder(req.user._id, goldAmount, isDemo);

    res.json({
      message: 'Buy order executed successfully',
      order: result.order,
      newBalance: result.newBalance
    });
  } catch (error) {
    console.error('Buy order error:', error.message, error.stack);
    const code = error.message === 'Insufficient SAR balance' ? 400 : 500;
    res.status(code).json({ message: error.message || 'Server error' });
  }
});

// Sell gold — mode: query/body/header 'demo' | 'real'
router.post('/sell', authenticate, [
  body('goldAmount').isFloat({ min: 0.01 }).withMessage('Gold amount must be at least 0.01 grams')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const mode = (req.body.mode || req.query.mode || req.headers['x-account-mode'] || 'real').toLowerCase();
    const isDemo = mode === 'demo';
    const { goldAmount } = req.body;
    const result = await executeSellOrder(req.user._id, parseFloat(goldAmount), isDemo);

    res.json({
      message: 'Sell order executed successfully',
      order: result.order,
      newBalance: result.newBalance
    });
  } catch (error) {
    console.error('Sell order error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get user's order history
router.get('/orders', authenticate, async (req, res) => {
  try {
    const Order = require('../models/Order');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('priceSnapshotId', 'timestamp spotPriceSAR');

    const total = await Order.countDocuments({ userId: req.user._id });

    res.json({
      orders,
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

// List user's physical gold holdings (vaulted / delivered) — mode: 'demo' | 'real'
router.get('/holdings', authenticate, async (req, res) => {
  try {
    const mode = (req.query.mode || req.headers['x-account-mode'] || 'real').toLowerCase();
    const isDemo = mode === 'demo';
    res.json({
      holdings: await GoldHolding.find({
        userId: req.user._id,
        isDemo,
        status: { $in: ['reserved', 'shipped', 'delivered'] }
      }).sort({ createdAt: -1 })
    });
  } catch (error) {
    console.error('Error loading holdings:', error);
    res.status(500).json({ message: 'Error loading holdings', error: error.message });
  }
});

module.exports = router;
