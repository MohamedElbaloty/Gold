const mongoose = require('mongoose');

const moneySchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: 'SAR', uppercase: true, trim: true }
  },
  { _id: false }
);

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    title: { type: String, required: true },
    sku: { type: String, default: '' },
    image: { type: String, default: '' },
    unitPrice: { type: moneySchema, required: true },
    quantity: { type: Number, required: true, min: 1, max: 999 }
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: '' },
    phone: { type: String, default: '' },
    country: { type: String, default: '' },
    city: { type: String, default: '' },
    area: { type: String, default: '' },
    street: { type: String, default: '' },
    notes: { type: String, default: '' }
  },
  { _id: false }
);

const ecomOrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    items: { type: [orderItemSchema], required: true },

    currency: { type: String, required: true, default: 'SAR', uppercase: true, trim: true },
    subtotal: { type: Number, required: true, min: 0 },
    shipping: { type: Number, required: true, min: 0, default: 0 },
    tax: { type: Number, required: true, min: 0, default: 0 },
    discount: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ['pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending_payment'
    },

    payment: {
      provider: { type: String, default: 'stripe' },
      status: { type: String, default: 'requires_payment' },
      paymentIntentId: { type: String, default: '' }
    },

    shippingAddress: { type: addressSchema, default: {} }
  },
  { timestamps: true }
);

ecomOrderSchema.index({ userId: 1, createdAt: -1 });
ecomOrderSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('EcomOrder', ecomOrderSchema);

