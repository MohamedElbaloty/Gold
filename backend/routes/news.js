const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const NewsArticle = require('../models/NewsArticle');
const { getAggregatedNews } = require('../services/newsAggregator');

const router = express.Router();

// Public: real-time external news feed (Mediastack + Kitco RSS + optional NewsAPI)
router.get('/feed', async (req, res) => {
  const lang = (req.query.lang || 'ar').trim().toLowerCase() === 'en' ? 'en' : 'ar';
  const limit = Math.min(Math.max(parseInt(req.query.limit || '24', 10), 1), 50);
  try {
    const articles = await getAggregatedNews({ lang, limit });
    res.json({
      articles,
      pagination: { page: 1, limit: articles.length, total: articles.length, pages: 1 }
    });
  } catch (error) {
    console.error('News feed error:', error.message);
    res.status(200).json({
      articles: [],
      pagination: { page: 1, limit: 0, total: 0, pages: 1 }
    });
  }
});

function toSlug(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

async function ensureUniqueSlug(baseSlug, excludeId) {
  let slug = baseSlug || 'news';
  let i = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await NewsArticle.exists(query);
    if (!exists) return slug;
    i += 1;
    slug = `${baseSlug}-${i}`;
  }
}

// Public: list news
router.get('/', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '12', 10), 1), 50);
    const skip = (page - 1) * limit;

    const filter = { isPublished: true };
    const language = String(req.query.lang || '').trim().toLowerCase();
    if (language === 'ar' || language === 'en') filter.language = language;

    const q = String(req.query.q || '').trim();
    if (q) filter.$text = { $search: q };

    const sort = q ? { score: { $meta: 'textScore' }, publishedAt: -1 } : { publishedAt: -1 };

    const [articles, total] = await Promise.all([
      NewsArticle.find(filter, q ? { score: { $meta: 'textScore' } } : undefined)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('title slug summary coverImage language publishedAt views')
        .lean(),
      NewsArticle.countDocuments(filter)
    ]);

    res.json({ articles, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Public: get article + increment views
router.get('/:slugOrId', async (req, res) => {
  try {
    const { slugOrId } = req.params;
    const isId = mongoose.isValidObjectId(slugOrId);

    const article = await NewsArticle.findOneAndUpdate(
      isId ? { _id: slugOrId, isPublished: true } : { slug: slugOrId, isPublished: true },
      { $inc: { views: 1 } },
      { new: true }
    ).lean();

    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.json({ article });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin/Merchant: create
router.post(
  '/',
  authenticate,
  authorize('admin', 'merchant'),
  [
    body('title').isString().trim().notEmpty(),
    body('slug').optional().isString().trim(),
    body('summary').optional().isString(),
    body('content').optional().isString(),
    body('coverImage').optional().isString(),
    body('language').optional().isIn(['ar', 'en']),
    body('isPublished').optional().isBoolean(),
    body('publishedAt').optional().isISO8601()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const baseSlug = toSlug(req.body.slug || req.body.title);
      const slug = await ensureUniqueSlug(baseSlug);

      const article = await NewsArticle.create({
        ...req.body,
        slug,
        publishedAt: req.body.publishedAt ? new Date(req.body.publishedAt) : new Date()
      });

      res.status(201).json({ article });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Admin/Merchant: update
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'merchant'),
  [
    body('title').optional().isString().trim().notEmpty(),
    body('slug').optional().isString().trim(),
    body('summary').optional().isString(),
    body('content').optional().isString(),
    body('coverImage').optional().isString(),
    body('language').optional().isIn(['ar', 'en']),
    body('isPublished').optional().isBoolean(),
    body('publishedAt').optional().isISO8601()
  ],
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid id' });
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const update = { ...req.body };
      if (update.slug || update.title) {
        const baseSlug = toSlug(update.slug || update.title);
        update.slug = await ensureUniqueSlug(baseSlug, req.params.id);
      }
      if (update.publishedAt) update.publishedAt = new Date(update.publishedAt);

      const article = await NewsArticle.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
      if (!article) return res.status(404).json({ message: 'Article not found' });
      res.json({ article });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

module.exports = router;

