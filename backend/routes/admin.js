const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const MerchantSettings = require('../models/MerchantSettings');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// All routes require admin or merchant role
router.use(authenticate);
router.use(authorize('admin', 'merchant'));

// Get all users
router.get('/users', authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Freeze/unfreeze user account
router.put('/users/:id/freeze', authorize('admin'), [
  body('isFrozen').isBoolean()
], async (req, res) => {
  try {
    const { isFrozen } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isFrozen = isFrozen;
    await user.save();

    res.json({ message: `User account ${isFrozen ? 'frozen' : 'unfrozen'}`, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get merchant settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await MerchantSettings.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update merchant settings
router.put('/settings', [
  body('spread').optional().isFloat({ min: 0, max: 0.1 }),
  body('buyMarkup').optional().isFloat({ min: 0 }),
  body('sellMarkup').optional().isFloat({ min: 0 }),
  body('minTradeAmount').optional().isFloat({ min: 0 }),
  body('maxTradeAmount').optional().isFloat({ min: 0 }),
  body('priceUpdateInterval').optional().isInt({ min: 10, max: 300 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const settings = await MerchantSettings.getSettings();
    const updates = req.body;
    
    Object.keys(updates).forEach(key => {
      if (settings.schema.paths[key]) {
        settings[key] = updates[key];
      }
    });

    settings.updatedBy = req.user._id;
    settings.lastUpdated = new Date();
    await settings.save();

    res.json({ message: 'Settings updated', settings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalOrders = await Order.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    
    const totalGoldBought = await Order.aggregate([
      { $match: { type: 'buy', status: 'executed' } },
      { $group: { _id: null, total: { $sum: '$goldAmount' } } }
    ]);

    const totalGoldSold = await Order.aggregate([
      { $match: { type: 'sell', status: 'executed' } },
      { $group: { _id: null, total: { $sum: '$goldAmount' } } }
    ]);

    const totalSARVolume = await Order.aggregate([
      { $match: { status: 'executed' } },
      { $group: { _id: null, total: { $sum: '$totalSAR' } } }
    ]);

    const recentOrders = await Order.find()
      .populate('userId', 'email firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      stats: {
        totalUsers,
        totalOrders,
        totalTransactions,
        totalGoldBought: totalGoldBought[0]?.total || 0,
        totalGoldSold: totalGoldSold[0]?.total || 0,
        totalSARVolume: totalSARVolume[0]?.total || 0,
        netExposure: (totalGoldBought[0]?.total || 0) - (totalGoldSold[0]?.total || 0)
      },
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all orders
router.get('/orders', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;
    const type = req.query.type; // 'buy' | 'sell'
    const status = req.query.status; // 'pending' | 'executed' | 'failed' | 'cancelled'
    const email = (req.query.email || '').trim().toLowerCase();

    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (email) {
      const users = await User.find({ email: new RegExp(email, 'i') }).select('_id').lean();
      const ids = users.map((u) => u._id);
      if (ids.length) filter.userId = { $in: ids };
      else filter.userId = { $in: [] };
    }

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('userId', 'email firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    res.json({
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order status (e.g. cancel pending only)
router.put('/orders/:id', [
  body('status').isIn(['cancelled']).withMessage('Only status "cancelled" allowed')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({ message: 'Order cancelled', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all transactions
router.get('/transactions', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find()
      .populate('userId', 'email firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Transaction.countDocuments();

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

module.exports = router;
