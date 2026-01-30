const cron = require('node-cron');
const { calculatePrices } = require('./pricingService');

// Update prices every 30 seconds (configurable)
let priceUpdateJob = null;

function startPriceUpdater(intervalSeconds = 30) {
  // Stop existing job if any
  if (priceUpdateJob) {
    priceUpdateJob.stop();
  }

  // Calculate cron expression (every N seconds)
  // Note: node-cron minimum is 1 minute, so for < 60 seconds, we use setInterval
  if (intervalSeconds < 60) {
    // Use setInterval for sub-minute updates (log only errors to avoid log spam)
    const intervalId = setInterval(async () => {
      try {
        await calculatePrices();
      } catch (error) {
        console.error('Error updating prices:', error);
      }
    }, intervalSeconds * 1000);

    // Store interval ID for cleanup
    priceUpdateJob = { stop: () => clearInterval(intervalId) };

    // Run immediately and generate initial data if needed
    (async () => {
      try {
        await calculatePrices();
        console.log(`Initial price fetched at ${new Date().toISOString()}`);
        
        // Generate some historical data points if database is empty
        const PriceSnapshot = require('../models/PriceSnapshot');
        const count = await PriceSnapshot.countDocuments();
        if (count < 10) {
          console.log('Generating initial historical data...');
          const prices = await require('./pricingService').getCurrentPrices();
          const now = Date.now();
          const basePrices = {
            gold: prices.spotPriceSAR,
            silver: prices.silverSpotPriceSAR || prices.spotPriceSAR * 0.012,
            platinum: prices.platinumSpotPriceSAR || prices.spotPriceSAR * 0.46
          };
          
          // Generate 50 historical points (one per minute for last 50 minutes)
          for (let i = 50; i >= 0; i--) {
            const timestamp = new Date(now - i * 60000);
            const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
            
            await PriceSnapshot.create({
              spotPriceUSD: prices.spotPriceUSD,
              spotPriceSAR: basePrices.gold * (1 + variation),
              buyPriceSAR: prices.buyPriceSAR,
              sellPriceSAR: prices.sellPriceSAR,
              silverSpotPriceUSD: prices.silverSpotPriceUSD,
              silverSpotPriceSAR: basePrices.silver * (1 + variation),
              silverBuyPriceSAR: prices.silverBuyPriceSAR,
              silverSellPriceSAR: prices.silverSellPriceSAR,
              platinumSpotPriceUSD: prices.platinumSpotPriceUSD,
              platinumSpotPriceSAR: basePrices.platinum * (1 + variation),
              platinumBuyPriceSAR: prices.platinumBuyPriceSAR,
              platinumSellPriceSAR: prices.platinumSellPriceSAR,
              spread: prices.spread,
              usdToSarRate: prices.usdToSarRate,
              timestamp: timestamp
            });
          }
          console.log('Initial historical data generated');
        }
      } catch (err) {
        console.error('Initial price fetch error:', err);
      }
    })();
  } else {
    // Use cron for minute-based intervals
    const minutes = Math.floor(intervalSeconds / 60);
    priceUpdateJob = cron.schedule(`*/${minutes} * * * * *`, async () => {
      try {
        await calculatePrices();
      } catch (error) {
        console.error('Error updating prices:', error);
      }
    });
    
    // Run immediately
    calculatePrices().catch(err => console.error('Initial price fetch error:', err));
  }
}

function stopPriceUpdater() {
  if (priceUpdateJob) {
    priceUpdateJob.stop();
    priceUpdateJob = null;
  }
}

module.exports = {
  startPriceUpdater,
  stopPriceUpdater
};
