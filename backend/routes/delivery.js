const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const DeliveryRequest = require('../models/DeliveryRequest');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { withOptionalTransaction, sessionOpts, withSession } = require('../lib/transaction');
const router = express.Router();

// Create delivery request
router.post('/request', authenticate, [
  body('goldAmount').isFloat({ min: 0.01 }),
  body('weight').isIn(['10g', '50g', '100g', '1kg']),
  body('deliveryAddress.street').notEmpty(),
  body('deliveryAddress.city').notEmpty(),
  body('contactPhone').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { goldAmount, weight, deliveryAddress, contactPhone } = req.body;

    // Check wallet balance and perform deduct + delivery request in optional transaction
    const deliveryRequest = await withOptionalTransaction(async (session) => {
      const wallet = await withSession(Wallet.findOne({ userId: req.user._id }), session);
      if (!wallet || wallet.goldBalance < goldAmount) {
        throw new Error('Insufficient gold balance');
      }

      const dr = await DeliveryRequest.create([{
        userId: req.user._id,
        goldAmount,
        weight,
        deliveryAddress,
        contactPhone
      }], sessionOpts(session));
      const deliveryRequestDoc = dr[0];

      wallet.goldBalance -= goldAmount;
      wallet.lastUpdated = new Date();
      await wallet.save(sessionOpts(session));

      await Transaction.create([{
        userId: req.user._id,
        type: 'delivery',
        goldAmount,
        sarAmount: 0,
        pricePerGram: 0,
        status: 'pending',
        balanceBefore: {
          goldBalance: wallet.goldBalance + goldAmount,
          sarBalance: wallet.sarBalance
        },
        balanceAfter: {
          goldBalance: wallet.goldBalance,
          sarBalance: wallet.sarBalance
        },
        metadata: {
          deliveryRequestId: deliveryRequestDoc._id
        }
      }], sessionOpts(session));

      return deliveryRequestDoc;
    });

    res.status(201).json({
      message: 'Delivery request created',
      deliveryRequest
    });
  } catch (error) {
    if (error.message === 'Insufficient gold balance') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's delivery requests
router.get('/my-requests', authenticate, async (req, res) => {
  try {
    const requests = await DeliveryRequest.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all delivery requests (merchant/admin)
router.get('/all', authenticate, authorize('merchant', 'admin'), async (req, res) => {
  try {
    const status = req.query.status;
    const query = status ? { status } : {};
    
    const requests = await DeliveryRequest.find(query)
      .populate('userId', 'email firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update delivery status (merchant/admin)
router.put('/:id/status', authenticate, authorize('merchant', 'admin'), [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  body('trackingNumber').optional().trim(),
  body('merchantNotes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, trackingNumber, merchantNotes } = req.body;
    const deliveryRequest = await DeliveryRequest.findById(req.params.id);

    if (!deliveryRequest) {
      return res.status(404).json({ message: 'Delivery request not found' });
    }

    deliveryRequest.status = status;
    if (trackingNumber) deliveryRequest.trackingNumber = trackingNumber;
    if (merchantNotes) deliveryRequest.merchantNotes = merchantNotes;
    deliveryRequest.processedBy = req.user._id;
    deliveryRequest.updatedAt = new Date();

    // Update timestamps based on status
    if (status === 'processing' && !deliveryRequest.processedAt) {
      deliveryRequest.processedAt = new Date();
    }
    if (status === 'shipped' && !deliveryRequest.shippedAt) {
      deliveryRequest.shippedAt = new Date();
    }
    if (status === 'delivered' && !deliveryRequest.deliveredAt) {
      deliveryRequest.deliveredAt = new Date();
    }

    await deliveryRequest.save();

    res.json({ message: 'Delivery status updated', deliveryRequest });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
