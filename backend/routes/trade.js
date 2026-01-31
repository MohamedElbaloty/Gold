const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { executeBuyOrder, executeSellOrder } = require('../services/tradingService');
const GoldHolding = require('../models/GoldHolding');
const router = express.Router();

function normalizeMetalType(metalType) {
  const m = String(metalType || 'gold').toLowerCase().trim();
  if (m === 'gold' || m === 'xau') return 'gold';
  if (m === 'silver' || m === 'xag') return 'silver';
  throw new Error('Invalid metal type. Use "gold" or "silver".');
}

function parseTradeRequest(req) {
  const mode = (req.body.mode || req.query.mode || req.headers['x-account-mode'] || 'real').toLowerCase();
  const isDemo = mode === 'demo';
  const metalType = normalizeMetalType(req.body.metal || (req.body.silverAmount != null ? 'silver' : 'gold'));
  const rawAmount = req.body.amount ?? req.body.amountGrams ?? req.body.goldAmount ?? req.body.silverAmount;
  const amountGrams = parseFloat(rawAmount);
  if (isNaN(amountGrams) || amountGrams < 0.01) {
    throw new Error('Amount must be at least 0.01 grams');
  }
  return { isDemo, metalType, amountGrams };
}

// Buy metal (gold/silver) — mode: query/body/header 'demo' | 'real' (default real)
router.post('/buy', authenticate, [
  body().custom((_, { req }) => {
    const has =
      req.body.amount != null ||
      req.body.amountGrams != null ||
      req.body.goldAmount != null ||
      req.body.silverAmount != null;
    if (!has) throw new Error('Amount is required');
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array().map((e) => e.msg).join(' ') || 'Validation failed' });
    }
    const { isDemo, metalType, amountGrams } = parseTradeRequest(req);
    const result = await executeBuyOrder(req.user._id, amountGrams, isDemo, metalType);

    res.json({
      message: 'Buy order executed successfully',
      order: result.order,
      newBalance: result.newBalance
    });
  } catch (error) {
    console.error('Buy order error:', error.message, error.stack);
    const code =
      error.message === 'Insufficient SAR balance' ||
      error.message?.includes('Amount must be') ||
      error.message?.includes('Invalid metal type')
        ? 400
        : 500;
    res.status(code).json({ message: error.message || 'Server error' });
  }
});

// Sell metal (gold/silver) — mode: query/body/header 'demo' | 'real'
router.post('/sell', authenticate, [
  body().custom((_, { req }) => {
    const has =
      req.body.amount != null ||
      req.body.amountGrams != null ||
      req.body.goldAmount != null ||
      req.body.silverAmount != null;
    if (!has) throw new Error('Amount is required');
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { isDemo, metalType, amountGrams } = parseTradeRequest(req);
    const result = await executeSellOrder(req.user._id, amountGrams, isDemo, metalType);

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

// List user's physical holdings (vaulted / delivered) — mode: 'demo' | 'real'
router.get('/holdings', authenticate, async (req, res) => {
  try {
    const mode = (req.query.mode || req.headers['x-account-mode'] || 'real').toLowerCase();
    const isDemo = mode === 'demo';
    const metal = req.query.metal ? normalizeMetalType(req.query.metal) : null;
    const where = {
      userId: req.user._id,
      isDemo,
      status: { $in: ['reserved', 'shipped', 'delivered'] }
    };
    if (metal) where.metalType = metal;
    res.json({
      holdings: await GoldHolding.find({
        ...where
      }).sort({ createdAt: -1 })
    });
  } catch (error) {
    console.error('Error loading holdings:', error);
    res.status(500).json({ message: 'Error loading holdings', error: error.message });
  }
});

module.exports = router;
