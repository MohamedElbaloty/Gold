const axios = require('axios');
const PriceSnapshot = require('../models/PriceSnapshot');
const MerchantSettings = require('../models/MerchantSettings');

function parseMetalsLiveSpot(responseData, metal) {
  // metals.live formats can vary. Common: [["gold", 2040.12, 1700000000]]
  // or: {"price": 2040.12} or raw number.
  if (typeof responseData === 'number') return responseData;
  if (responseData && typeof responseData.price === 'number') return responseData.price;
  if (Array.isArray(responseData)) {
    // Try array of tuples
    for (const row of responseData) {
      if (Array.isArray(row) && typeof row[0] === 'string' && row[0].toLowerCase().includes(metal)) {
        if (typeof row[1] === 'number') return row[1];
      }
    }
    // Or plain [price, ts]
    if (responseData.length >= 1 && typeof responseData[0] === 'number') return responseData[0];
  }
  return null;
}

async function fetchSpotPriceUSDPerOunce(metal) {
  const upper = metal.toUpperCase();

  // Preferred: GoldAPI.io (or compatible) when API key is configured
  const goldApiKey = process.env.GOLDAPI_KEY || process.env.GOLD_API_KEY;
  const goldApiBase = process.env.GOLDAPI_BASE_URL || 'https://www.goldapi.io/api';
  if (goldApiKey) {
    const symbol = upper === 'GOLD' || upper === 'XAU' ? 'XAU' : upper === 'SILVER' || upper === 'XAG' ? 'XAG' : 'XPT';
    const url = `${goldApiBase}/${symbol}/USD`;
    try {
      const response = await axios.get(url, {
        timeout: 5000,
        headers: {
          'x-access-token': goldApiKey,
          'Content-Type': 'application/json'
        }
      });
      // GoldAPI returns price per troy ounce in USD in `price`
      if (response.data && typeof response.data.price === 'number') {
        return response.data.price;
      }
      // Some variants expose `price_1oz` or similar
      if (typeof response.data?.price_1oz === 'number') {
        return response.data.price_1oz;
      }
      throw new Error('Unexpected GoldAPI response shape');
    } catch (error) {
      console.error(`Error fetching ${metal} price from GoldAPI:`, error.message);
      // fall through to secondary provider
    }
  }

  // Try metals-api.com (free tier, no key required for basic usage)
  const metalsApiKey = process.env.METALS_API_KEY;
  if (metalsApiKey) {
    try {
      const symbol = upper === 'GOLD' || upper === 'XAU' ? 'XAU' : upper === 'SILVER' || upper === 'XAG' ? 'XAG' : 'XPT';
      const url = `https://metals-api.com/api/latest?access_key=${metalsApiKey}&base=USD&symbols=${symbol}`;
      const response = await axios.get(url, { timeout: 5000 });
      if (response.data && response.data.rates && typeof response.data.rates[symbol] === 'number') {
        return response.data.rates[symbol];
      }
    } catch (error) {
      console.error(`Error fetching ${metal} price from metals-api.com:`, error.message);
    }
  }

  // Try freegoldprice.org (free API, no key required)
  try {
    const symbol = metal === 'gold' ? 'XAU' : metal === 'silver' ? 'XAG' : 'XPT';
    const url = `https://api.freegoldprice.org/v1/${symbol.toLowerCase()}/USD`;
    const response = await axios.get(url, { timeout: 5000 });
    if (response.data && typeof response.data.price === 'number') {
      return response.data.price;
    }
    if (response.data && typeof response.data === 'number') {
      return response.data;
    }
  } catch (error) {
    console.error(`Error fetching ${metal} price from freegoldprice.org:`, error.message);
  }

  // Fallback: metals.live free API (best-effort, no key)
  const key = upper;
  const envKey = `${key}_PRICE_API_URL`;
  const url =
    process.env[envKey] ||
    (metal === 'gold'
      ? 'https://api.metals.live/v1/spot/gold'
      : metal === 'silver'
        ? 'https://api.metals.live/v1/spot/silver'
        : metal === 'platinum'
          ? 'https://api.metals.live/v1/spot/platinum'
          : null);
  if (url) {
    try {
      const response = await axios.get(url, {
        timeout: 5000
      });
      const parsed = parseMetalsLiveSpot(response.data, metal);
      if (typeof parsed === 'number') return parsed;
      if (typeof response.data === 'number') return response.data;
    } catch (error) {
      console.error(`Error fetching ${metal} price from metals.live:`, error.message);
    }
  }

  // Final fallback: Use realistic market prices (approximate as of 2025)
  console.warn(`Using fallback price for ${metal}`);
  const fallbackPrices = {
    gold: 2050,    // USD per troy ounce (approximate)
    silver: 24.5,  // USD per troy ounce (approximate)
    platinum: 950  // USD per troy ounce (approximate)
  };
  return fallbackPrices[metal] || 2000;
}

// Fetch gold/silver spot price in USD per gram (fallback to last snapshot if needed)
async function fetchMetalSpotPriceUSDPerGram(metal) {
  try {
    const pricePerOunceUSD = await fetchSpotPriceUSDPerOunce(metal);
    return pricePerOunceUSD / 31.1035; // troy ounce to grams
  } catch (error) {
    const lastSnapshot = await PriceSnapshot.findOne().sort({ timestamp: -1 });
    if (lastSnapshot) {
      if (metal === 'gold' && typeof lastSnapshot.spotPriceUSD === 'number') return lastSnapshot.spotPriceUSD;
      if (metal === 'silver' && typeof lastSnapshot.silverSpotPriceUSD === 'number') return lastSnapshot.silverSpotPriceUSD;
      if (metal === 'platinum' && typeof lastSnapshot.platinumSpotPriceUSD === 'number') return lastSnapshot.platinumSpotPriceUSD;
    }
    // sane defaults (USD/gram)
    if (metal === 'gold') return 65;
    if (metal === 'silver') return 0.8;
    return 30; // platinum approx USD/gram fallback
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
    const spotPriceUSD = await fetchMetalSpotPriceUSDPerGram('gold');
    const silverSpotPriceUSD = await fetchMetalSpotPriceUSDPerGram('silver');
    const platinumSpotPriceUSD = await fetchMetalSpotPriceUSDPerGram('platinum');
    const usdToSarRate = parseFloat(process.env.USD_TO_SAR_RATE) || 3.75;
    const spotPriceSAR = convertUSDToSAR(spotPriceUSD, usdToSarRate);
    const silverSpotPriceSAR = convertUSDToSAR(silverSpotPriceUSD, usdToSarRate);
    const platinumSpotPriceSAR = convertUSDToSAR(platinumSpotPriceUSD, usdToSarRate);

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

    // Silver prices (same spread logic)
    const silverBuyPriceSAR = silverSpotPriceSAR * (1 + spread / 2 + buyMarkup);
    const silverSellPriceSAR = silverSpotPriceSAR * (1 - spread / 2 - sellMarkup);

    // Platinum prices (same spread logic)
    const platinumBuyPriceSAR = platinumSpotPriceSAR * (1 + spread / 2 + buyMarkup);
    const platinumSellPriceSAR = platinumSpotPriceSAR * (1 - spread / 2 - sellMarkup);

    // Create price snapshot
    const snapshot = await PriceSnapshot.create({
      spotPriceUSD,
      spotPriceSAR,
      buyPriceSAR,
      sellPriceSAR,
      silverSpotPriceUSD,
      silverSpotPriceSAR,
      silverBuyPriceSAR,
      silverSellPriceSAR,
      platinumSpotPriceUSD,
      platinumSpotPriceSAR,
      platinumBuyPriceSAR,
      platinumSellPriceSAR,
      spread,
      usdToSarRate,
      timestamp: new Date()
    });

    return {
      spotPriceUSD,
      spotPriceSAR,
      buyPriceSAR,
      sellPriceSAR,
      silverSpotPriceUSD,
      silverSpotPriceSAR,
      silverBuyPriceSAR,
      silverSellPriceSAR,
      platinumSpotPriceUSD,
      platinumSpotPriceSAR,
      platinumBuyPriceSAR,
      platinumSellPriceSAR,
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

// In-memory cache for spot-only (1s TTL) — used for homepage "global price" second-by-second
const SPOT_CACHE_TTL_MS = 1000;
let spotCache = { data: null, expiresAt: 0 };

async function getSpotOnly() {
  const now = Date.now();
  if (spotCache.data && now < spotCache.expiresAt) {
    return spotCache.data;
  }
  try {
    const spotPriceUSD = await fetchMetalSpotPriceUSDPerGram('gold');
    const silverSpotPriceUSD = await fetchMetalSpotPriceUSDPerGram('silver');
    const platinumSpotPriceUSD = await fetchMetalSpotPriceUSDPerGram('platinum');
    const usdToSarRate = parseFloat(process.env.USD_TO_SAR_RATE) || 3.75;
    const spotPriceSAR = convertUSDToSAR(spotPriceUSD, usdToSarRate);
    const silverSpotPriceSAR = convertUSDToSAR(silverSpotPriceUSD, usdToSarRate);
    const platinumSpotPriceSAR = convertUSDToSAR(platinumSpotPriceUSD, usdToSarRate);
    const gold24 = spotPriceSAR;
    const gold22 = gold24 ? (gold24 * 22) / 24 : null;
    const gold21 = gold24 ? (gold24 * 21) / 24 : null;
    const gold18 = gold24 ? (gold24 * 18) / 24 : null;
    const data = {
      spotPriceUSD,
      spotPriceSAR,
      silverSpotPriceUSD,
      silverSpotPriceSAR,
      platinumSpotPriceUSD,
      platinumSpotPriceSAR,
      usdToSarRate,
      currency: 'SAR',
      gold: {
        perGram24k: gold24,
        perGram22k: gold22,
        perGram21k: gold21,
        perGram18k: gold18
      },
      silver: silverSpotPriceSAR
        ? { perGram: silverSpotPriceSAR, perKg: silverSpotPriceSAR * 1000 }
        : null,
      platinum: platinumSpotPriceSAR ? { perGram: platinumSpotPriceSAR } : null,
      timestamp: new Date()
    };
    spotCache = { data, expiresAt: now + SPOT_CACHE_TTL_MS };
    return data;
  } catch (err) {
    console.error('getSpotOnly error:', err);
    if (spotCache.data) return spotCache.data;
    throw err;
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
          silverSpotPriceUSD: recentSnapshot.silverSpotPriceUSD,
          silverSpotPriceSAR: recentSnapshot.silverSpotPriceSAR,
          silverBuyPriceSAR: recentSnapshot.silverBuyPriceSAR,
          silverSellPriceSAR: recentSnapshot.silverSellPriceSAR,
          platinumSpotPriceUSD: recentSnapshot.platinumSpotPriceUSD,
          platinumSpotPriceSAR: recentSnapshot.platinumSpotPriceSAR,
          platinumBuyPriceSAR: recentSnapshot.platinumBuyPriceSAR,
          platinumSellPriceSAR: recentSnapshot.platinumSellPriceSAR,
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
  fetchMetalSpotPriceUSDPerGram,
  convertUSDToSAR,
  calculatePrices,
  getCurrentPrices,
  getSpotOnly
};
