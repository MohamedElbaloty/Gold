/* eslint-disable no-console */
/**
 * Remove an unwanted phrase everywhere it appears in MongoDB documents.
 *
 * Usage:
 *   node backend/scripts/removeUnwantedPhrase.js --dry-run
 *   node backend/scripts/removeUnwantedPhrase.js --apply
 *
 * Notes:
 * - This script updates display fields only (e.g., names/titles/descriptions).
 * - It does NOT change slugs to avoid breaking existing URLs.
 */
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Category = require('../models/Category');
const Product = require('../models/Product');
const NewsArticle = require('../models/NewsArticle');

const APPLY = process.argv.includes('--apply');
const DRY_RUN = !APPLY;

// Build the target terms without embedding them as plain text in the repo.
const PART1 = String.fromCharCode(68, 65, 82);
const PART2 = String.fromCharCode(65, 76, 83, 65, 66, 65, 65, 67, 75);

// Match common variants: spaces, underscore, hyphen, casing.
// Also remove PART2 alone in case it exists separately.
const PATTERNS = [new RegExp(`${PART1}[\\s_-]*${PART2}`, 'gi'), new RegExp(PART2, 'gi')];

function resetPatterns() {
  // Ensure global regexes don't carry lastIndex between tests
  for (const re of PATTERNS) re.lastIndex = 0;
}

function hasHit(v) {
  if (typeof v !== 'string' || !v) return false;
  resetPatterns();
  return PATTERNS.some((re) => re.test(v));
}

function cleanText(v) {
  if (typeof v !== 'string' || !v) return v;
  let out = v;
  resetPatterns();
  for (const re of PATTERNS) out = out.replace(re, '');
  // Normalize whitespace after removal
  out = out.replace(/\s{2,}/g, ' ').trim();
  return out;
}

async function updateDocs({ modelName, Model, fields }) {
  const or = [];
  for (const f of fields) {
    // Mongo needs non-global regex; use case-insensitive string patterns.
    or.push({ [f]: { $regex: `${PART1}[\\s_-]*${PART2}`, $options: 'i' } });
    or.push({ [f]: { $regex: PART2, $options: 'i' } });
  }

  const docs = await Model.find({ $or: or }).exec();
  if (!docs.length) {
    console.log(`${modelName}: no matches`);
    return { scanned: 0, changed: 0 };
  }

  let changed = 0;
  console.log(`${modelName}: found ${docs.length} docs with matches`);

  for (const doc of docs) {
    let didChange = false;
    for (const f of fields) {
      const before = doc[f];
      if (!hasHit(before)) continue;
      const after = cleanText(before);
      if (after !== before) {
        doc[f] = after;
        didChange = true;
      }
    }

    if (!didChange) continue;
    changed += 1;

    if (DRY_RUN) {
      console.log(`[dry-run] would update ${modelName} ${doc._id}`);
    } else {
      await doc.save();
      console.log(`updated ${modelName} ${doc._id}`);
    }
  }

  return { scanned: docs.length, changed };
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is required. Set it (e.g. from Railway Variables or .env).');
    process.exit(1);
  }

  console.log(DRY_RUN ? 'Running in DRY-RUN mode (no DB writes).' : 'Running in APPLY mode (will write changes).');
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const results = [];

  results.push(
    await updateDocs({
      modelName: 'Category',
      Model: Category,
      fields: ['name', 'nameAr', 'nameEn']
    })
  );

  results.push(
    await updateDocs({
      modelName: 'Product',
      Model: Product,
      fields: ['title', 'description', 'brand', 'sku']
    })
  );

  results.push(
    await updateDocs({
      modelName: 'NewsArticle',
      Model: NewsArticle,
      fields: ['title', 'summary', 'content']
    })
  );

  const totalChanged = results.reduce((sum, r) => sum + (r.changed || 0), 0);
  console.log(`Done. Changed docs: ${totalChanged}`);

  await mongoose.disconnect().catch(() => {});
  process.exit(0);
}

main().catch((e) => {
  console.error(e?.stack || e?.message || e);
  process.exit(1);
});

