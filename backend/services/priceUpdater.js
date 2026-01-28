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
    // Use setInterval for sub-minute updates
    setInterval(async () => {
      try {
        await calculatePrices();
        console.log(`Price updated at ${new Date().toISOString()}`);
      } catch (error) {
        console.error('Error updating prices:', error);
      }
    }, intervalSeconds * 1000);
    
    // Also run immediately
    calculatePrices().catch(err => console.error('Initial price fetch error:', err));
  } else {
    // Use cron for minute-based intervals
    const minutes = Math.floor(intervalSeconds / 60);
    priceUpdateJob = cron.schedule(`*/${minutes} * * * * *`, async () => {
      try {
        await calculatePrices();
        console.log(`Price updated at ${new Date().toISOString()}`);
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
