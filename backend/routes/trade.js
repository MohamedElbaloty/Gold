const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { executeBuyOrder, executeSellOrder } = require('../services/tradingService');
const router = express.Router();

// Buy gold
router.post('/buy', authenticate, [
  body('goldAmount').isFloat({ min: 0.01 }).withMessage('Gold amount must be at least 0.01 grams')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { goldAmount } = req.body;
    const result = await executeBuyOrder(req.user._id, parseFloat(goldAmount));

    res.json({
      message: 'Buy order executed successfully',
      order: result.order,
      newBalance: result.newBalance
    });
  } catch (error) {
    console.error('Buy order error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Sell gold
router.post('/sell', authenticate, [
  body('goldAmount').isFloat({ min: 0.01 }).withMessage('Gold amount must be at least 0.01 grams')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { goldAmount } = req.body;
    const result = await executeSellOrder(req.user._id, parseFloat(goldAmount));

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

module.exports = router;
