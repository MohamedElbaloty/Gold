const mongoose = require('mongoose');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const MerchantSettings = require('../models/MerchantSettings');
const GoldHolding = require('../models/GoldHolding');
const { getCurrentPrices } = require('./pricingService');
const { withOptionalTransaction, sessionOpts, withSession } = require('../lib/transaction');

// ----- Halal physical bullion trading -----

function normalizeMetalType(metalType) {
  const m = String(metalType || 'gold').toLowerCase().trim();
  if (m === 'gold' || m === 'xau') return 'gold';
  if (m === 'silver' || m === 'xag') return 'silver';
  throw new Error('Invalid metal type. Use "gold" or "silver".');
}

function getMetalPrices(prices, metalType) {
  const m = normalizeMetalType(metalType);
  if (m === 'gold') {
    return {
      metalType: 'gold',
      buyPriceSAR: prices.buyPriceSAR,
      sellPriceSAR: prices.sellPriceSAR,
      spotPriceSAR: prices.spotPriceSAR
    };
  }
  return {
    metalType: 'silver',
    buyPriceSAR: prices.silverBuyPriceSAR,
    sellPriceSAR: prices.silverSellPriceSAR,
    spotPriceSAR: prices.silverSpotPriceSAR
  };
}

function calcTotalValueSAR(wallet, prices) {
  const gb = Number(wallet.goldBalance || 0);
  const sb = Number(wallet.silverBalance || 0);
  const goldVal = gb * Number(prices.buyPriceSAR || 0);
  const silverVal = sb * Number(prices.silverBuyPriceSAR || 0);
  return goldVal + silverVal;
}

// Execute buy order: convert SAR balance into a vaulted physical gold holding
async function executeBuyOrder(userId, amountGrams, isDemo = false, metalType = 'gold') {
  const uid = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
  return withOptionalTransaction(async (session) => {
    // Validate amount
    const settings = await MerchantSettings.getSettings();
    if (amountGrams < settings.minTradeAmount || amountGrams > settings.maxTradeAmount) {
      throw new Error(`Trade amount must be between ${settings.minTradeAmount} and ${settings.maxTradeAmount} grams`);
    }

    // Get current prices
    const prices = await getCurrentPrices();
    const metalPrices = getMetalPrices(prices, metalType);
    if (!metalPrices.buyPriceSAR) throw new Error('Price feed unavailable for requested metal');
    const totalSAR = amountGrams * metalPrices.buyPriceSAR;

    // Get or create wallet (demo or real)
    let wallet = await withSession(Wallet.findOne({ userId: uid, isDemo }), session);
    if (!wallet) {
      const created = await Wallet.create([{ userId: uid, isDemo, sarBalance: isDemo ? 100000 : 0 }], sessionOpts(session));
      wallet = created[0];
    }

    // Check if user has enough SAR balance
    if (wallet.sarBalance < totalSAR) {
      throw new Error('Insufficient SAR balance');
    }

    // Record balances before
    const balanceBefore = {
      goldBalance: wallet.goldBalance,
      silverBalance: wallet.silverBalance,
      sarBalance: wallet.sarBalance
    };

    // Update wallet (deduct SAR, keep goldBalance for legacy metrics only)
    wallet.sarBalance -= totalSAR;
    if (metalPrices.metalType === 'gold') {
      wallet.goldBalance = Number(wallet.goldBalance || 0) + amountGrams;
      wallet.totalGoldBought = Number(wallet.totalGoldBought || 0) + amountGrams;
    } else {
      wallet.silverBalance = Number(wallet.silverBalance || 0) + amountGrams;
      wallet.totalSilverBought = Number(wallet.totalSilverBought || 0) + amountGrams;
    }
    wallet.totalValueInSAR = calcTotalValueSAR(wallet, prices);
    wallet.lastUpdated = new Date();
    await wallet.save(sessionOpts(session));

    // Create order record
    const [order] = await Order.create(
      [
        {
          userId: uid,
          type: 'buy',
          metalType: metalPrices.metalType,
          goldAmount: amountGrams,
          pricePerGram: metalPrices.buyPriceSAR,
          totalSAR,
          status: 'executed',
          executedAt: new Date(),
          priceSnapshotId: prices.snapshotId,
          executionDetails: {
            lockedPrice: metalPrices.buyPriceSAR,
            actualPrice: metalPrices.buyPriceSAR,
            spread: prices.spread
          }
        }
      ],
      sessionOpts(session)
    );

    // Create vaulted holding for the user (reserved in Saudi vault)
    const holding = await GoldHolding.create(
      [
        {
          userId: uid,
          orderId: order._id,
          metalType: metalPrices.metalType,
          goldAmount: amountGrams,
          weightGrams: amountGrams,
          purchasePricePerGram: metalPrices.buyPriceSAR,
          purchaseTotalSAR: totalSAR,
          status: 'reserved',
          storageType: 'vault',
          isDemo
        }
      ],
      sessionOpts(session)
    );

    // Create transaction
    await Transaction.create(
      [
        {
          userId: uid,
          type: 'buy',
          orderId: order._id,
          metalType: metalPrices.metalType,
          goldAmount: amountGrams,
          sarAmount: totalSAR,
          pricePerGram: metalPrices.buyPriceSAR,
          status: 'completed',
          balanceBefore,
          balanceAfter: {
            goldBalance: wallet.goldBalance,
            silverBalance: wallet.silverBalance,
            sarBalance: wallet.sarBalance
          },
          metadata: {
            holdingId: holding[0]._id,
            mode: 'physical',
            note: `Saudi vaulted ${metalPrices.metalType} purchase`
          }
        }
      ],
      sessionOpts(session)
    );

    return {
      order,
      holding: holding[0],
      newBalance: {
        goldBalance: wallet.goldBalance,
        silverBalance: wallet.silverBalance,
        sarBalance: wallet.sarBalance
      }
    };
  });
}

// Execute sell order: sell from a specific physical holding back to SAR
async function executeSellOrder(userId, amountGrams, isDemo = false, metalType = 'gold') {
  return withOptionalTransaction(async (session) => {
    // Validate amount
    const settings = await MerchantSettings.getSettings();
    if (amountGrams < settings.minTradeAmount || amountGrams > settings.maxTradeAmount) {
      throw new Error(`Trade amount must be between ${settings.minTradeAmount} and ${settings.maxTradeAmount} grams`);
    }

    // Get current prices
    const prices = await getCurrentPrices();
    const metalPrices = getMetalPrices(prices, metalType);
    if (!metalPrices.sellPriceSAR) throw new Error('Price feed unavailable for requested metal');
    const totalSAR = amountGrams * metalPrices.sellPriceSAR;

    // Get wallet (demo or real)
    const uid = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
    const wallet = await withSession(Wallet.findOne({ userId: uid, isDemo }), session);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // Check if user has enough vaulted holdings to cover this amount (same mode)
    const holdingWhere = {
      userId: uid,
      isDemo,
      status: { $in: ['reserved', 'delivered'] }
    };
    // Backward compatibility: old docs may not have metalType (assume gold)
    if (metalPrices.metalType === 'gold') {
      holdingWhere.$or = [{ metalType: 'gold' }, { metalType: { $exists: false } }];
    } else {
      holdingWhere.metalType = metalPrices.metalType;
    }
    let q = GoldHolding.find(holdingWhere).sort({ createdAt: 1 });
    q = withSession(q, session);
    const holdings = await q;

    let remaining = amountGrams;
    const sellingHoldings = [];
    for (const h of holdings) {
      if (remaining <= 0) break;
      const available = h.goldAmount;
      if (available <= 0) continue;
      const take = Math.min(available, remaining);
      sellingHoldings.push({ holding: h, amount: take });
      remaining -= take;
    }

    if (remaining > 0) {
      throw new Error(`Insufficient vaulted ${metalPrices.metalType} holdings to sell this amount`);
    }

    // Record balances before
    const balanceBefore = {
      goldBalance: wallet.goldBalance,
      silverBalance: wallet.silverBalance,
      sarBalance: wallet.sarBalance
    };

    // Update wallet metrics
    if (metalPrices.metalType === 'gold') {
      wallet.goldBalance = Math.max(0, Number(wallet.goldBalance || 0) - amountGrams);
      wallet.totalGoldSold = Number(wallet.totalGoldSold || 0) + amountGrams;
    } else {
      wallet.silverBalance = Math.max(0, Number(wallet.silverBalance || 0) - amountGrams);
      wallet.totalSilverSold = Number(wallet.totalSilverSold || 0) + amountGrams;
    }
    wallet.sarBalance += totalSAR;
    wallet.totalValueInSAR = calcTotalValueSAR(wallet, prices);
    wallet.lastUpdated = new Date();
    await wallet.save(sessionOpts(session));

    // Mark holdings as sold or partially sold
    for (const { holding, amount } of sellingHoldings) {
      if (amount >= holding.goldAmount - 1e-6) {
        holding.status = 'sold';
        holding.goldAmount = 0;
      } else {
        const next = holding.goldAmount - amount;
        // Guard against float noise pushing slightly below zero
        holding.goldAmount = next <= 1e-6 ? 0 : next;
      }
      await holding.save(sessionOpts(session));
    }

    // Create order
    const [order] = await Order.create(
      [
        {
          userId: uid,
          type: 'sell',
          metalType: metalPrices.metalType,
          goldAmount: amountGrams,
          pricePerGram: metalPrices.sellPriceSAR,
          totalSAR,
          status: 'executed',
          executedAt: new Date(),
          priceSnapshotId: prices.snapshotId,
          executionDetails: {
            lockedPrice: metalPrices.sellPriceSAR,
            actualPrice: metalPrices.sellPriceSAR,
            spread: prices.spread
          }
        }
      ],
      sessionOpts(session)
    );

    // Create transaction
    await Transaction.create(
      [
        {
          userId: uid,
          type: 'sell',
          orderId: order._id,
          metalType: metalPrices.metalType,
          goldAmount: amountGrams,
          sarAmount: totalSAR,
          pricePerGram: metalPrices.sellPriceSAR,
          status: 'completed',
          balanceBefore,
          balanceAfter: {
            goldBalance: wallet.goldBalance,
            silverBalance: wallet.silverBalance,
            sarBalance: wallet.sarBalance
          },
          metadata: {
            mode: 'physical',
            note: `Saudi vaulted ${metalPrices.metalType} sell-back`
          }
        }
      ],
      sessionOpts(session)
    );

    return {
      order,
      newBalance: {
        goldBalance: wallet.goldBalance,
        silverBalance: wallet.silverBalance,
        sarBalance: wallet.sarBalance
      }
    };
  });
}

module.exports = {
  executeBuyOrder,
  executeSellOrder
};

// Legacy leveraged trading APIs kept below (not exported) for reference, but no longer used

async function openLeveragedPosition(userId, { side, goldAmount, leverage }) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const settings = await MerchantSettings.getSettings();
    if (goldAmount < settings.minTradeAmount || goldAmount > settings.maxTradeAmount) {
      throw new Error(
        `Trade amount must be between ${settings.minTradeAmount} and ${settings.maxTradeAmount} grams`
      );
    }

    const maxLev = settings.maxLeverage || 20;
    const contractSize = settings.contractSizeGrams || 1;

    if (!['long', 'short'].includes(side)) {
      throw new Error('Invalid side. Use "long" or "short".');
    }

    if (!leverage || leverage < 1 || leverage > maxLev) {
      throw new Error(`Invalid leverage. Must be between 1 and ${maxLev}.`);
    }

    // Enforce lot size multiples (similar to contract size in brokers)
    if (contractSize > 0) {
      const lots = goldAmount / contractSize;
      const lotsRounded = Math.round(lots * 1000) / 1000; // allow small float noise
      if (Math.abs(lots - lotsRounded) > 1e-6) {
        throw new Error(`Amount must be a multiple of contract size (${contractSize} g).`);
      }
    }

    const prices = await getCurrentPrices();
    const entryPrice = side === 'long' ? prices.buyPriceSAR : prices.sellPriceSAR;
    const notional = goldAmount * entryPrice;
    const marginRequired = notional / leverage;

    // Get wallet
    let wallet = await Wallet.findOne({ userId }).session(session);
    if (!wallet) {
      wallet = await Wallet.create([{ userId }], { session });
      wallet = wallet[0];
    }

    if (wallet.sarBalance < marginRequired) {
      throw new Error('Insufficient SAR balance for required margin');
    }

    // Lock margin
    wallet.sarBalance -= marginRequired;
    wallet.marginLockedSAR = (wallet.marginLockedSAR || 0) + marginRequired;
    wallet.lastUpdated = new Date();
    await wallet.save({ session });

    // Create position
    const [position] = await Position.create(
      [
        {
          userId,
          instrument: 'XAU_SAR',
          side,
          goldAmount,
          leverage,
          openPriceSAR: entryPrice,
          openNotionalSAR: notional,
          marginUsedSAR: marginRequired,
          priceSnapshotId: prices.snapshotId,
          status: 'open',
          openedAt: new Date()
        }
      ],
      { session }
    );

    await session.commitTransaction();

    return {
      position,
      wallet: {
        sarBalance: wallet.sarBalance,
        marginLockedSAR: wallet.marginLockedSAR
      }
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Close an existing leveraged position and realize PnL.
 */
async function closeLeveragedPosition(userId, positionId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const position = await Position.findOne({ _id: positionId, userId, status: 'open' }).session(
      session
    );

    if (!position) {
      throw new Error('Open position not found');
    }

    const prices = await getCurrentPrices();
    const exitPrice = position.side === 'long' ? prices.sellPriceSAR : prices.buyPriceSAR;
    const exitNotional = position.goldAmount * exitPrice;

    // Long: PnL = (exit - entry) * qty
    // Short: PnL = (entry - exit) * qty
    let pnl = 0;
    if (position.side === 'long') {
      pnl = exitNotional - position.openNotionalSAR;
    } else {
      pnl = position.openNotionalSAR - exitNotional;
    }

    // Unlock margin and apply PnL to wallet
    const wallet = await Wallet.findOne({ userId }).session(session);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const marginUsed = position.marginUsedSAR;
    wallet.marginLockedSAR = Math.max(0, (wallet.marginLockedSAR || 0) - marginUsed);
    wallet.sarBalance += marginUsed + pnl;
    wallet.lastUpdated = new Date();
    await wallet.save({ session });

    position.status = 'closed';
    position.closePriceSAR = exitPrice;
    position.closeNotionalSAR = exitNotional;
    position.pnlSAR = pnl;
    position.closedAt = new Date();
    await position.save({ session });

    await session.commitTransaction();

    return {
      position,
      wallet: {
        sarBalance: wallet.sarBalance,
        marginLockedSAR: wallet.marginLockedSAR
      }
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Get all open positions for a user, with live PnL calculated from current prices.
 */
async function getOpenPositionsWithPnl(userId) {
  const [positions, prices] = await Promise.all([
    Position.find({ userId, status: 'open' }).sort({ openedAt: -1 }).lean(),
    getCurrentPrices()
  ]);

  const currentBid = prices.sellPriceSAR;
  const currentAsk = prices.buyPriceSAR;

  const enriched = positions.map((p) => {
    const currentPrice = p.side === 'long' ? currentBid : currentAsk;
    const currentNotional = p.goldAmount * currentPrice;
    let pnl = 0;
    if (p.side === 'long') {
      pnl = currentNotional - p.openNotionalSAR;
    } else {
      pnl = p.openNotionalSAR - currentNotional;
    }
    return {
      ...p,
      currentPriceSAR: currentPrice,
      currentNotionalSAR: currentNotional,
      unrealizedPnlSAR: pnl
    };
  });

  return {
    positions: enriched,
    prices: {
      buyPriceSAR: prices.buyPriceSAR,
      sellPriceSAR: prices.sellPriceSAR,
      spotPriceSAR: prices.spotPriceSAR
    }
  };
}
