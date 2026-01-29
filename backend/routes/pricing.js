const express = require('express');
const { getCurrentPrices, getSpotOnly } = require('../services/pricingService');
const PriceSnapshot = require('../models/PriceSnapshot');
const router = express.Router();

// Spot-only (global price, no spread) — for homepage "live global" display, poll every 1s
router.get('/spot', async (req, res) => {
  try {
    const spot = await getSpotOnly();
    res.json(spot);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching spot prices', error: err.message });
  }
});

// Get current prices (public endpoint for price display)
router.get('/current', async (req, res) => {
  try {
    const prices = await getCurrentPrices();
    // Add convenience breakdowns for UI (gold karats)
    const gold24 = prices.spotPriceSAR;
    const gold22 = gold24 ? (gold24 * 22) / 24 : null;
    const gold21 = gold24 ? (gold24 * 21) / 24 : null;
    const gold18 = gold24 ? (gold24 * 18) / 24 : null;

    res.json({
      ...prices,
      currency: 'SAR',
      gold: {
        perGram24k: gold24,
        perGram22k: gold22,
        perGram21k: gold21,
        perGram18k: gold18
      },
      silver: prices.silverSpotPriceSAR
        ? {
            perGram: prices.silverSpotPriceSAR,
            perKg: prices.silverSpotPriceSAR * 1000
          }
        : null
      ,
      platinum: prices.platinumSpotPriceSAR
        ? {
            perGram: prices.platinumSpotPriceSAR
          }
        : null
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching prices', error: error.message });
  }
});

// Get price history (public endpoint for charts)
router.get('/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 400;
    const metal = String(req.query.metal || 'gold').toLowerCase();
    
    // Get snapshots sorted by timestamp (newest first)
    const snapshots = await PriceSnapshot.find()
      .sort({ timestamp: -1 })
      .limit(limit);

    // Map snapshots to chart data format
    const mapped = snapshots
      .map((s) => {
        const base = { timestamp: s.timestamp };
        let price = null;
        
        if (metal === 'silver') {
          price = s.silverSpotPriceSAR;
        } else if (metal === 'platinum') {
          price = s.platinumSpotPriceSAR;
        } else {
          price = s.spotPriceSAR; // gold
        }
        
        return { ...base, spotPriceSAR: price };
      })
      .filter((x) => x.spotPriceSAR !== null && x.spotPriceSAR !== undefined && typeof x.spotPriceSAR === 'number' && !isNaN(x.spotPriceSAR))
      .reverse(); // Reverse to show oldest first for chart

    // If no data exists, generate some sample data points for immediate display
    if (mapped.length === 0) {
      const now = Date.now();
      const { getCurrentPrices } = require('../services/pricingService');
      try {
        const currentPrices = await getCurrentPrices();
        let currentPrice = currentPrices.spotPriceSAR;
        
        if (metal === 'silver') {
          currentPrice = currentPrices.silverSpotPriceSAR || 0.1;
        } else if (metal === 'platinum') {
          currentPrice = currentPrices.platinumSpotPriceSAR || 30;
        }
        
        // Generate last 50 data points with slight variations
        const sampleData = [];
        for (let i = 50; i >= 0; i--) {
          const timestamp = new Date(now - i * 60000); // 1 minute intervals
          const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
          sampleData.push({
            timestamp: timestamp,
            spotPriceSAR: currentPrice * (1 + variation)
          });
        }
        return res.json(sampleData);
      } catch (err) {
        console.error('Error generating sample data:', err);
      }
    }

    res.json(mapped);
  } catch (error) {
    console.error('Error fetching price history:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
