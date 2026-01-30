const mongoose = require('mongoose');

const moneySchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: 'SAR', uppercase: true, trim: true }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
    images: [{ type: String }],

    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: false },

    sku: { type: String, trim: true },
    brand: { type: String, trim: true },
    metalType: { type: String, enum: ['gold', 'silver', 'platinum', 'jewellery', 'other'], default: 'other' },
    karat: { type: Number, min: 0 },
    weightGrams: { type: Number, min: 0 },

    price: { type: moneySchema, required: true },
    stockQty: { type: Number, default: 0, min: 0 },

    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

productSchema.index({ title: 'text', description: 'text', sku: 'text', brand: 'text' });
productSchema.index({ categoryId: 1, isActive: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });

module.exports = mongoose.model('Product', productSchema);

