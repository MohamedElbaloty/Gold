const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const { withOptionalTransaction, sessionOpts, withSession } = require('../lib/transaction');

const Category = require('../models/Category');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const EcomOrder = require('../models/EcomOrder');

const router = express.Router();

function toSlug(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-') // allow arabic letters too
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

async function ensureUniqueSlug(model, baseSlug, excludeId) {
  let slug = baseSlug || 'item';
  let i = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await model.exists(query);
    if (!exists) return slug;
    i += 1;
    slug = `${baseSlug}-${i}`;
  }
}

// -------------------------
// Categories
// -------------------------

router.get('/categories', async (req, res) => {
  try {
    // Include categories where isActive is true or not set (Atlas data may lack the field)
    const list = await Category.find({ $or: [{ isActive: true }, { isActive: { $exists: false } }] })
      .sort({ parentId: 1, sortOrder: 1, name: 1 })
      .lean();
    const categories = Array.isArray(list) ? list : [];
    return res.json({ categories });
  } catch (error) {
    console.error('GET /categories error:', error.message);
    return res.status(200).json({ categories: [] });
  }
});

// Get single category by slug (for catalog pages like daralsabaek.com/products/catalog/46)
router.get('/categories/slug/:slug', async (req, res) => {
  try {
    const slug = String(req.params.slug || '').trim().toLowerCase();
    const category = await Category.findOne({
      slug,
      $or: [{ isActive: true }, { isActive: { $exists: false } }]
    }).lean();
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ category });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post(
  '/categories',
  authenticate,
  authorize('admin', 'merchant'),
  [
    body('name').isString().trim().notEmpty(),
    body('slug').optional().isString().trim(),
    body('parentId').optional({ nullable: true }).isString(),
    body('sortOrder').optional().isInt({ min: 0 }),
    body('isActive').optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { name, parentId = null, sortOrder = 0, isActive = true } = req.body;
      const baseSlug = toSlug(req.body.slug || name);
      const slug = await ensureUniqueSlug(Category, baseSlug);

      const category = await Category.create({
        name,
        slug,
        parentId: parentId || null,
        sortOrder,
        isActive
      });

      res.status(201).json({ category });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// -------------------------
// Products
// -------------------------

router.get('/products', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const skip = (page - 1) * limit;

    // Include products where isActive is true or not set (Atlas data may lack the field)
    const filter = { $or: [{ isActive: true }, { isActive: { $exists: false } }] };

    if (req.query.ids) {
      const ids = String(req.query.ids)
        .split(',')
        .map((s) => s.trim())
        .filter((s) => mongoose.isValidObjectId(s));
      if (ids.length > 0) {
        filter._id = { $in: ids };
      }
    }

    if (req.query.category) {
      filter.categoryId = req.query.category;
    }

    // Resolve category by slug if provided
    if (req.query.categorySlug) {
      const cat = await Category.findOne({
        slug: String(req.query.categorySlug).trim().toLowerCase(),
        $or: [{ isActive: true }, { isActive: { $exists: false } }]
      }).select('_id').lean();
      if (cat) filter.categoryId = cat._id;
      else filter.categoryId = null; // no matching category -> return empty
    }

    if (req.query.featured === 'true') {
      filter.isFeatured = true;
    }

    const q = String(req.query.q || '').trim();
    if (q) {
      filter.$text = { $search: q };
    }

    const sort = q ? { score: { $meta: 'textScore' }, createdAt: -1 } : { createdAt: -1 };

    const [products, total] = await Promise.all([
      Product.find(filter, q ? { score: { $meta: 'textScore' } } : undefined)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('categoryId', 'name slug')
        .lean(),
      Product.countDocuments(filter)
    ]);

    res.json({
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('GET /products error:', error.message);
    return res.status(200).json({
      products: [],
      pagination: { page: 1, limit: Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100), total: 0, pages: 0 }
    });
  }
});

router.get('/products/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isId = mongoose.isValidObjectId(idOrSlug);
    const product = await Product.findOne(isId ? { _id: idOrSlug } : { slug: idOrSlug })
      .populate('categoryId', 'name slug')
      .lean();

    if (!product || !product.isActive) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post(
  '/products',
  authenticate,
  authorize('admin', 'merchant'),
  [
    body('title').isString().trim().notEmpty(),
    body('slug').optional().isString().trim(),
    body('description').optional().isString(),
    body('images').optional().isArray(),
    body('categoryId').optional().isString(),
    body('sku').optional().isString(),
    body('brand').optional().isString(),
    body('metalType').optional().isString(),
    body('karat').optional({ nullable: true }).isFloat({ min: 0 }),
    body('weightGrams').optional({ nullable: true }).isFloat({ min: 0 }),
    body('price.amount').isFloat({ min: 0 }),
    body('price.currency').optional().isString().trim(),
    body('stockQty').optional().isInt({ min: 0 }),
    body('isFeatured').optional().isBoolean(),
    body('isActive').optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const baseSlug = toSlug(req.body.slug || req.body.title);
      const slug = await ensureUniqueSlug(Product, baseSlug);

      const product = await Product.create({
        ...req.body,
        slug,
        price: {
          amount: Number(req.body.price.amount),
          currency: (req.body.price.currency || 'KWD').toUpperCase()
        }
      });

      res.status(201).json({ product });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

router.put(
  '/products/:id',
  authenticate,
  authorize('admin', 'merchant'),
  [
    body('title').optional().isString().trim().notEmpty(),
    body('slug').optional().isString().trim(),
    body('description').optional().isString(),
    body('images').optional().isArray(),
    body('categoryId').optional().isString(),
    body('sku').optional().isString(),
    body('brand').optional().isString(),
    body('metalType').optional().isString(),
    body('karat').optional({ nullable: true }).isFloat({ min: 0 }),
    body('weightGrams').optional({ nullable: true }).isFloat({ min: 0 }),
    body('price.amount').optional().isFloat({ min: 0 }),
    body('price.currency').optional().isString().trim(),
    body('stockQty').optional().isInt({ min: 0 }),
    body('isFeatured').optional().isBoolean(),
    body('isActive').optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const update = { ...req.body };

      if (update.slug || update.title) {
        const baseSlug = toSlug(update.slug || update.title);
        update.slug = await ensureUniqueSlug(Product, baseSlug, req.params.id);
      }

      if (update.price?.amount !== undefined || update.price?.currency !== undefined) {
        const current = await Product.findById(req.params.id).select('price').lean();
        if (!current) return res.status(404).json({ message: 'Product not found' });
        update.price = {
          amount: update.price?.amount !== undefined ? Number(update.price.amount) : Number(current.price.amount),
          currency: (update.price?.currency || current.price.currency || 'KWD').toUpperCase()
        };
      }

      const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
      if (!product) return res.status(404).json({ message: 'Product not found' });
      res.json({ product });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// -------------------------
// Cart
// -------------------------

router.get('/cart', authenticate, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId').lean();
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
      cart = await Cart.findById(cart._id).populate('items.productId').lean();
    }
    res.json({ cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put(
  '/cart',
  authenticate,
  [body('items').isArray()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const rawItems = req.body.items || [];
      const normalized = [];
      const byProduct = new Map();

      for (const it of rawItems) {
        const productId = String(it.productId || '');
        const quantity = Number(it.quantity || 0);
        if (!mongoose.isValidObjectId(productId) || !Number.isFinite(quantity) || quantity < 1) continue;
        byProduct.set(productId, (byProduct.get(productId) || 0) + Math.floor(quantity));
      }

      for (const [productId, quantity] of byProduct.entries()) {
        normalized.push({ productId, quantity: Math.min(quantity, 999) });
      }

      const cart = await Cart.findOneAndUpdate(
        { userId: req.user._id },
        { $set: { items: normalized } },
        { upsert: true, new: true }
      ).populate('items.productId');

      res.json({ cart });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// -------------------------
// Checkout + Orders
// -------------------------

router.post(
  '/checkout',
  authenticate,
  [
    body('paymentProvider').optional().isString().trim(),
    body('shippingAddress').optional().isObject(),
    body('shippingAddress.fullName').optional().isString(),
    body('shippingAddress.phone').optional().isString(),
    body('shippingAddress.country').optional().isString(),
    body('shippingAddress.city').optional().isString(),
    body('shippingAddress.area').optional().isString(),
    body('shippingAddress.street').optional().isString(),
    body('shippingAddress.notes').optional().isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const paymentProvider = (req.body.paymentProvider || 'stripe').toLowerCase();
      const shippingAddress = req.body.shippingAddress || {};

      const createdOrder = await withOptionalTransaction(async (session) => {
        const cart = await withSession(Cart.findOne({ userId: req.user._id }), session).lean();
        if (!cart || !cart.items || cart.items.length === 0) {
          throw new Error('Cart is empty');
        }

        const productIds = cart.items.map((i) => i.productId);
        const products = await withSession(
          Product.find({ _id: { $in: productIds }, isActive: true }),
          session
        ).lean();
        const productById = new Map(products.map((p) => [String(p._id), p]));

        const items = [];
        let subtotal = 0;
        let currency = 'SAR';

        for (const ci of cart.items) {
          const p = productById.get(String(ci.productId));
          if (!p) throw new Error('One or more products are unavailable');
          if (p.stockQty < ci.quantity) throw new Error(`Insufficient stock for ${p.title}`);
          currency = (p.price?.currency || currency).toUpperCase();
          const unitPrice = Number(p.price?.amount || 0);
          items.push({
            productId: p._id,
            title: p.title,
            sku: p.sku || '',
            image: Array.isArray(p.images) && p.images[0] ? p.images[0] : '',
            unitPrice: { amount: unitPrice, currency },
            quantity: ci.quantity
          });
          subtotal += unitPrice * ci.quantity;
        }

        // decrement stock
        for (const ci of cart.items) {
          await withSession(
            Product.updateOne(
              { _id: ci.productId, stockQty: { $gte: ci.quantity } },
              { $inc: { stockQty: -ci.quantity } }
            ),
            session
          );
        }

        const shipping = 0;
        const tax = 0;
        const discount = 0;
        const total = Math.max(subtotal + shipping + tax - discount, 0);

        const order = await EcomOrder.create(
          [
            {
              userId: req.user._id,
              items,
              currency,
              subtotal,
              shipping,
              tax,
              discount,
              total,
              status: 'pending_payment',
              payment: {
                provider: paymentProvider,
                status: 'requires_payment',
                paymentIntentId: ''
              },
              shippingAddress
            }
          ],
          sessionOpts(session)
        );

        await withSession(
          Cart.updateOne({ userId: req.user._id }, { $set: { items: [] } }),
          session
        );

        return order;
      });

      res.status(201).json({
        order: createdOrder?.[0],
        payment: {
          provider: (req.body.paymentProvider || 'stripe').toLowerCase(),
          nextStep:
            'Payment gateway integration is scaffolded. Provide API keys and we will create a real payment intent/session.',
          status: 'requires_payment'
        }
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

router.get('/orders', authenticate, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      EcomOrder.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      EcomOrder.countDocuments({ userId: req.user._id })
    ]);

    res.json({ orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/orders/:id', authenticate, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid order id' });
    const order = await EcomOrder.findOne({ _id: req.params.id, userId: req.user._id }).lean();
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

