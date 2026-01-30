const mongoose = require('mongoose');

const newsArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true, lowercase: true },
    summary: { type: String, default: '' },
    content: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    language: { type: String, enum: ['ar', 'en'], default: 'ar' },
    isPublished: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now },
    views: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

newsArticleSchema.index({ isPublished: 1, publishedAt: -1 });
// Use a custom language override field to avoid Mongo treating "language" as text index override
newsArticleSchema.index(
  { title: 'text', summary: 'text', content: 'text' },
  { default_language: 'none', language_override: '__lang' }
);

module.exports = mongoose.model('NewsArticle', newsArticleSchema);

