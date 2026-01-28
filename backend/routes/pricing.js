const express = require('express');
const { authenticate } = require('../middleware/auth');
const { getCurrentPrices } = require('../services/pricingService');
const PriceSnapshot = require('../models/PriceSnapshot');
const router = express.Router();

// Get current prices (public endpoint for price display)
router.get('/current', async (req, res) => {
  try {
    const prices = await getCurrentPrices();
    res.json(prices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching prices', error: error.message });
  }
});

// Get price history (authenticated)
router.get('/history', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const snapshots = await PriceSnapshot.find()
      .sort({ timestamp: -1 })
      .limit(limit);
    
    res.json(snapshots);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
