const express = require('express');
const mongoose = require('mongoose');
const { authenticate } = require('../middleware/auth');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const WalletTransferRequest = require('../models/WalletTransferRequest');
const { body, validationResult } = require('express-validator');
const { withOptionalTransaction, sessionOpts, withSession } = require('../lib/transaction');
const router = express.Router();

function fallbackWallet(isDemo) {
  return {
    userId: null,
    isDemo,
    goldBalance: 0,
    silverBalance: 0,
    sarBalance: isDemo ? 100000 : 0,
    marginLockedSAR: 0,
    totalGoldBought: 0,
    totalGoldSold: 0,
    totalSilverBought: 0,
    totalSilverSold: 0,
    totalValueInSAR: 0,
    lastUpdated: new Date(),
    createdAt: new Date()
  };
}

// Get wallet balance — mode: 'demo' | 'real' (default real)
router.get('/balance', authenticate, async (req, res) => {
  const mode = (req.query.mode || req.headers['x-account-mode'] || 'real').toLowerCase();
  const isDemo = mode === 'demo';
  let userId = req.user && req.user._id ? req.user._id : null;
  if (!userId) {
    return res.status(401).json({ message: 'User not found' });
  }
  try {
    userId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
  } catch (_) {
    return res.status(200).json(fallbackWallet(isDemo));
  }

  try {
    let wallet = await Wallet.findOne({ userId, isDemo }).lean();
    if (!wallet && !isDemo) {
      const legacy = await Wallet.findOne({
        userId,
        $or: [{ isDemo: false }, { isDemo: { $exists: false } }]
      });
      if (legacy) {
        if (legacy.isDemo !== false) {
          try {
            legacy.isDemo = false;
            await legacy.save();
          } catch (e) {
            if (e.code !== 11000) throw e;
          }
        }
        wallet = legacy.toObject ? legacy.toObject() : legacy;
      }
    }
    if (!wallet) {
      try {
        const created = await Wallet.create({
          userId,
          isDemo,
          sarBalance: isDemo ? 100000 : 0
        });
        wallet = created.toObject ? created.toObject() : created;
      } catch (createErr) {
        if (createErr.code === 11000) {
          wallet = await Wallet.findOne({ userId, isDemo }).lean();
        }
        if (!wallet) throw createErr;
      }
    }

    return res.json(wallet);
  } catch (error) {
    console.error('Wallet balance error:', error.message, error.stack);
    return res.status(200).json(fallbackWallet(isDemo));
  }
});

// Get transaction history
router.get('/transactions', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('orderId', 'type metalType goldAmount pricePerGram');

    const total = await Transaction.countDocuments({ userId: req.user._id });

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

// Deposit SAR — real account only (in production, integrate with payment gateway)
router.post('/deposit', authenticate, [
  body('amount').isFloat({ min: 0.01 }),
  body('method').optional().isString(),
  body('reference').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const mode = (req.body.mode || req.headers['x-account-mode'] || 'real').toLowerCase();
    if (mode === 'demo') {
      return res.status(400).json({ message: 'Deposit is not allowed on demo account' });
    }

    const { amount, method, reference, details } = req.body;
    const amountNum = parseFloat(amount);

    const result = await withOptionalTransaction(async (session) => {
      let w = await withSession(Wallet.findOne({ userId: req.user._id, isDemo: false }), session);
      if (!w) {
        const created = await Wallet.create([{ userId: req.user._id, isDemo: false }], sessionOpts(session));
        w = created[0];
      }

      const balanceBefore = { goldBalance: w.goldBalance, silverBalance: w.silverBalance, sarBalance: w.sarBalance };

      const [tx] = await Transaction.create(
        [
          {
            userId: req.user._id,
            type: 'deposit',
            goldAmount: 0,
            sarAmount: amountNum,
            pricePerGram: 0,
            status: 'pending',
            balanceBefore,
            balanceAfter: balanceBefore,
            metadata: {
              method: method || 'bank_transfer',
              reference: reference || ''
            }
          }
        ],
        sessionOpts(session)
      );

      const [reqDoc] = await WalletTransferRequest.create(
        [
          {
            userId: req.user._id,
            type: 'deposit',
            amountSAR: amountNum,
            method: method || 'bank_transfer',
            reference: reference || '',
            details: details || {},
            status: 'pending',
            transactionId: tx._id
          }
        ],
        sessionOpts(session)
      );

      // Link back for easier audit
      tx.metadata = new Map([...(tx.metadata || new Map()), ['requestId', reqDoc._id.toString()]]);
      await tx.save(sessionOpts(session));

      return { wallet: w, request: reqDoc, transaction: tx };
    });

    res.json({
      message: 'Deposit request created. Please complete payment/transfer; admin will approve and balance will update.',
      ...result
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Withdraw SAR — real account only (in production, integrate with payment rails & KYC)
router.post('/withdraw', authenticate, [
  body('amount').isFloat({ min: 0.01 }),
  body('method').optional().isString(),
  body('reference').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const mode = (req.body.mode || req.headers['x-account-mode'] || 'real').toLowerCase();
    if (mode === 'demo') {
      return res.status(400).json({ message: 'Withdrawal is not allowed on demo account' });
    }

    const { amount, method, reference, details } = req.body;
    const amountNum = parseFloat(amount);

    const result = await withOptionalTransaction(async (session) => {
      const w = await withSession(Wallet.findOne({ userId: req.user._id, isDemo: false }), session);
      if (!w) throw new Error('Wallet not found');
      if (w.sarBalance < amountNum) throw new Error('Insufficient SAR balance');

      const balanceBefore = { goldBalance: w.goldBalance, silverBalance: w.silverBalance, sarBalance: w.sarBalance };

      // Reserve funds by deducting immediately (request is still pending for payout)
      w.sarBalance = Math.max(0, w.sarBalance - amountNum);
      w.lastUpdated = new Date();
      await w.save(sessionOpts(session));

      const [tx] = await Transaction.create(
        [
          {
            userId: req.user._id,
            type: 'withdrawal',
            goldAmount: 0,
            sarAmount: amountNum,
            pricePerGram: 0,
            status: 'pending',
            balanceBefore,
            balanceAfter: { goldBalance: w.goldBalance, silverBalance: w.silverBalance, sarBalance: w.sarBalance },
            metadata: {
              method: method || 'bank_transfer',
              reference: reference || ''
            }
          }
        ],
        sessionOpts(session)
      );

      const [reqDoc] = await WalletTransferRequest.create(
        [
          {
            userId: req.user._id,
            type: 'withdrawal',
            amountSAR: amountNum,
            method: method || 'bank_transfer',
            reference: reference || '',
            details: details || {},
            status: 'pending',
            transactionId: tx._id
          }
        ],
        sessionOpts(session)
      );

      tx.metadata = new Map([...(tx.metadata || new Map()), ['requestId', reqDoc._id.toString()]]);
      await tx.save(sessionOpts(session));

      return { wallet: w, request: reqDoc, transaction: tx };
    });

    res.json({
      message: 'Withdrawal request created. Funds reserved; admin will process payout.',
      ...result
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// List user's deposit/withdraw requests (real account)
router.get('/transfer-requests', authenticate, async (req, res) => {
  try {
    const mode = (req.query.mode || req.headers['x-account-mode'] || 'real').toLowerCase();
    if (mode === 'demo') {
      return res.json({ requests: [] });
    }
    const requests = await WalletTransferRequest.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(Math.min(parseInt(req.query.limit) || 50, 100))
      .lean();
    return res.json({ requests });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
