const mongoose = require('mongoose');

const walletTransferRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['deposit', 'withdrawal'],
      required: true,
      index: true
    },
    amountSAR: {
      type: Number,
      required: true,
      min: 0.01
    },
    method: {
      // KSA-focused rails (expand later)
      type: String,
      enum: ['bank_transfer', 'mada', 'stcpay', 'cash_deposit', 'other'],
      default: 'bank_transfer'
    },
    reference: {
      // transfer reference, last4, receipt id, etc.
      type: String,
      default: ''
    },
    details: {
      // free-form: IBAN, bank name, account holder, notes, etc.
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
      index: true
    },
    // Optional linkage to a transaction entry created for audit
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    },
    decidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    decidedAt: {
      type: Date
    },
    adminNote: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

walletTransferRequestSchema.index({ userId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('WalletTransferRequest', walletTransferRequestSchema);

