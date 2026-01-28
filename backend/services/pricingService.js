const axios = require('axios');
const PriceSnapshot = require('../models/PriceSnapshot');
const MerchantSettings = require('../models/MerchantSettings');

// Fetch gold spot price (using a free API - replace with your preferred source)
async function fetchGoldSpotPrice() {
  try {
    // Using metals.live API (free tier available)
    // Alternative: Use a paid API like GoldAPI, MetalsAPI, or connect to a broker feed
    const response = await axios.get('https://api.metals.live/v1/spot/gold', {
      timeout: 5000
    });
    
    // If API returns price in USD per ounce, convert to per gram
    // 1 troy ounce = 31.1035 grams
    const pricePerOunceUSD = response.data.price || response.data;
    const pricePerGramUSD = pricePerOunceUSD / 31.1035;
    
    return pricePerGramUSD;
  } catch (error) {
    console.error('Error fetching gold price:', error.message);
    // Fallback: return last known price or a default
    const lastSnapshot = await PriceSnapshot.findOne().sort({ timestamp: -1 });
    if (lastSnapshot) {
      return lastSnapshot.spotPriceUSD;
    }
    // Default fallback (approximate price)
    return 65; // ~$65 per gram as fallback
  }
}

// Convert USD to SAR
function convertUSDToSAR(usdAmount, rate = null) {
  const usdToSarRate = rate || parseFloat(process.env.USD_TO_SAR_RATE) || 3.75;
  return usdAmount * usdToSarRate;
}

// Calculate buy and sell prices with spread
async function calculatePrices() {
  try {
    const spotPriceUSD = await fetchGoldSpotPrice();
    const usdToSarRate = parseFloat(process.env.USD_TO_SAR_RATE) || 3.75;
    const spotPriceSAR = convertUSDToSAR(spotPriceUSD, usdToSarRate);

    // Get merchant settings for spread
    const settings = await MerchantSettings.getSettings();
    const spread = settings.spread || 0.02; // Default 2%
    const buyMarkup = settings.buyMarkup || 0.01;
    const sellMarkup = settings.sellMarkup || 0.01;

    // Calculate prices
    // Buy price: user buys from merchant (merchant sells) = spot + markup
    const buyPriceSAR = spotPriceSAR * (1 + spread / 2 + buyMarkup);
    
    // Sell price: user sells to merchant (merchant buys) = spot - markup
    const sellPriceSAR = spotPriceSAR * (1 - spread / 2 - sellMarkup);

    // Create price snapshot
    const snapshot = await PriceSnapshot.create({
      spotPriceUSD,
      spotPriceSAR,
      buyPriceSAR,
      sellPriceSAR,
      spread,
      usdToSarRate,
      timestamp: new Date()
    });

    return {
      spotPriceUSD,
      spotPriceSAR,
      buyPriceSAR,
      sellPriceSAR,
      spread,
      usdToSarRate,
      timestamp: snapshot.timestamp,
      snapshotId: snapshot._id
    };
  } catch (error) {
    console.error('Error calculating prices:', error);
    throw error;
  }
}

// Get current prices (use cached if recent, otherwise fetch new)
async function getCurrentPrices() {
  try {
    const settings = await MerchantSettings.getSettings();
    const cacheWindow = (settings.priceUpdateInterval || 30) * 1000; // Convert to ms
    
    // Check for recent snapshot
    const recentSnapshot = await PriceSnapshot.findOne()
      .sort({ timestamp: -1 });
    
    if (recentSnapshot) {
      const age = Date.now() - recentSnapshot.timestamp.getTime();
      if (age < cacheWindow) {
        // Return cached price
        return {
          spotPriceUSD: recentSnapshot.spotPriceUSD,
          spotPriceSAR: recentSnapshot.spotPriceSAR,
          buyPriceSAR: recentSnapshot.buyPriceSAR,
          sellPriceSAR: recentSnapshot.sellPriceSAR,
          spread: recentSnapshot.spread,
          usdToSarRate: recentSnapshot.usdToSarRate,
          timestamp: recentSnapshot.timestamp,
          snapshotId: recentSnapshot._id
        };
      }
    }

    // Fetch new prices
    return await calculatePrices();
  } catch (error) {
    console.error('Error getting current prices:', error);
    throw error;
  }
}

module.exports = {
  fetchGoldSpotPrice,
  convertUSDToSAR,
  calculatePrices,
  getCurrentPrices
};
