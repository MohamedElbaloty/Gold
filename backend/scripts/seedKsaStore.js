/* eslint-disable no-console */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: require('path').join(__dirname, '..', '.env') });

const Category = require('../models/Category');
const Product = require('../models/Product');
const NewsArticle = require('../models/NewsArticle');

function slugify(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

async function upsertCategory(name) {
  const slug = slugify(name);
  return await Category.findOneAndUpdate(
    { slug },
    { $setOnInsert: { name, slug, isActive: true, sortOrder: 0 } },
    { upsert: true, new: true }
  );
}

async function upsertProduct(p) {
  const slug = slugify(p.title);
  const payload = { ...p, slug };
  if (payload.price && typeof payload.price.amount === 'number') {
    payload.price = { amount: payload.price.amount, currency: payload.price.currency || 'SAR' };
  }
  return await Product.findOneAndUpdate(
    { slug },
    { $set: payload },
    { upsert: true, new: true }
  );
}

async function upsertNews(a) {
  const slug = slugify(a.title);
  return await NewsArticle.findOneAndUpdate(
    { slug },
    { $set: { ...a, slug, isPublished: true, publishedAt: a.publishedAt || new Date() } },
    { upsert: true, new: true }
  );
}

async function seedStore({ connectIfNeeded = true } = {}) {
  const uri = process.env.MONGODB_URI;
  if (!uri && connectIfNeeded) {
    throw new Error('MONGODB_URI is required. Set it (e.g. from Railway Variables or .env).');
  }

  const shouldConnect = connectIfNeeded && mongoose.connection.readyState !== 1;
  if (shouldConnect) {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
  }

  // Ensure indexes are compatible (especially News text index)
  try {
    await NewsArticle.syncIndexes();
  } catch (e) {
    console.warn('NewsArticle syncIndexes warning:', e.message);
  }

  // Image placeholders - gold bar, silver, jewelry (Unsplash / placeholder)
  const IMG = {
    goldBar: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=600',
    goldBar2: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=600',
    silverBar: 'https://images.unsplash.com/photo-1573408301185-40d26c2d2d5a?w=600',
    jewelry: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600',
    watch: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600',
    diamond: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600',
    chain: 'https://images.unsplash.com/photo-1611652022419-a9419f74343a?w=600',
    ring: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600',
    bracelet: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=600',
    gift: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600'
  };

  const goldBars = await upsertCategory('سبائك ذهب');
  const silverBars = await upsertCategory('سبائك فضة');

  // السبائك أولاً في التصنيفات (sortOrder 0 و 1)
  await Category.updateOne({ _id: goldBars._id }, { $set: { sortOrder: 0 } });
  await Category.updateOne({ _id: silverBars._id }, { $set: { sortOrder: 1 } });

  // Catalogs - all categories with sortOrder for display (تبدأ من 2 بعد السبائك)
  const catalogList = [
    { name: 'Emirates Bullion / BTC', sortOrder: 2 },
    { name: 'swiss bar', sortOrder: 3 },
    { name: 'PAMP Bullion', sortOrder: 4 },
    { name: 'MagicWire®', sortOrder: 5 },
    { name: 'RANCANGELO', sortOrder: 6 },
    { name: "D'orica", sortOrder: 7 },
    { name: 'Watch', sortOrder: 8 },
    { name: 'Diamond', sortOrder: 9 },
    { name: 'Monaco Chain', sortOrder: 10 },
    { name: 'Premium Products', sortOrder: 11 },
    { name: 'Silver', sortOrder: 12 },
    { name: 'Othmani Lera and Georgian', sortOrder: 13 },
    { name: 'Disney & Marvel Collection', sortOrder: 14 },
    { name: 'Silver Jewellery', sortOrder: 15 },
    { name: 'Sets', sortOrder: 16 },
    { name: 'White Gold', sortOrder: 17 },
    { name: 'Islamic', sortOrder: 18 },
    { name: 'Rings', sortOrder: 19 },
    { name: 'Bracelet & Ring', sortOrder: 20 },
    { name: 'Sabhat', sortOrder: 21 },
    { name: 'Frame', sortOrder: 22 },
    { name: 'Bracelet', sortOrder: 23 },
    { name: 'Ear Rings', sortOrder: 24 },
    { name: 'chains', sortOrder: 25 },
    { name: 'Light Weight Collection', sortOrder: 26 },
    { name: 'Kids Selection', sortOrder: 27 },
    { name: 'Gift Boxes', sortOrder: 28 },
    { name: 'Wholesale prices', sortOrder: 29 }
  ];

  const categoryByName = { 'سبائك ذهب': goldBars, 'سبائك فضة': silverBars };
  for (const { name, sortOrder } of catalogList) {
    const slug = slugify(name);
    const cat = await Category.findOneAndUpdate(
      { slug },
      { $set: { sortOrder }, $setOnInsert: { name, slug, isActive: true } },
      { upsert: true, new: true }
    );
    categoryByName[name] = cat;
  }

  // ---- سبائك ذهب ----
  const goldProducts = [
    { title: 'سبيكة ذهب 1 جرام (24K)', description: 'سبيكة ذهب عيار 24 - 1 جرام', images: [IMG.goldBar], categoryId: goldBars._id, metalType: 'gold', karat: 24, weightGrams: 1, price: { amount: 265, currency: 'SAR' }, stockQty: 100, isFeatured: true },
    { title: 'سبيكة ذهب 5 جرام (24K)', description: 'سبيكة ذهب عيار 24 - 5 جرام', images: [IMG.goldBar], categoryId: goldBars._id, metalType: 'gold', karat: 24, weightGrams: 5, price: { amount: 1320, currency: 'SAR' }, stockQty: 80, isFeatured: true },
    { title: 'سبيكة ذهب 10 جرام (24K)', description: 'سبيكة ذهب عيار 24 - 10 جرام', images: [IMG.goldBar, IMG.goldBar2], categoryId: goldBars._id, metalType: 'gold', karat: 24, weightGrams: 10, price: { amount: 2640, currency: 'SAR' }, stockQty: 50, isFeatured: true },
    { title: 'سبيكة ذهب 20 جرام (24K)', description: 'سبيكة ذهب عيار 24 - 20 جرام', images: [IMG.goldBar2], categoryId: goldBars._id, metalType: 'gold', karat: 24, weightGrams: 20, price: { amount: 5280, currency: 'SAR' }, stockQty: 40 },
    { title: 'سبيكة ذهب 50 جرام (24K)', description: 'سبيكة ذهب عيار 24 - 50 جرام', images: [IMG.goldBar, IMG.goldBar2], categoryId: goldBars._id, metalType: 'gold', karat: 24, weightGrams: 50, price: { amount: 13200, currency: 'SAR' }, stockQty: 20, isFeatured: true },
    { title: 'سبيكة ذهب 100 جرام (24K)', description: 'سبيكة ذهب عيار 24 - 100 جرام', images: [IMG.goldBar2], categoryId: goldBars._id, metalType: 'gold', karat: 24, weightGrams: 100, price: { amount: 26400, currency: 'SAR' }, stockQty: 15 },
    { title: 'سبيكة ذهب 250 جرام (24K)', description: 'سبيكة ذهب عيار 24 - 250 جرام', images: [IMG.goldBar], categoryId: goldBars._id, metalType: 'gold', karat: 24, weightGrams: 250, price: { amount: 66000, currency: 'SAR' }, stockQty: 10 },
    { title: 'سبيكة ذهب 1 كيلو (24K)', description: 'سبيكة ذهب عيار 24 - 1 كجم', images: [IMG.goldBar2], categoryId: goldBars._id, metalType: 'gold', karat: 24, weightGrams: 1000, price: { amount: 264000, currency: 'SAR' }, stockQty: 5 }
  ];
  for (const p of goldProducts) await upsertProduct({ ...p, isActive: true });

  // ---- سبائك فضة ----
  const silverProducts = [
    { title: 'سبيكة فضة 100 جرام', description: 'سبيكة فضة نقاء عالي - 100 جرام', images: [IMG.silverBar], categoryId: silverBars._id, metalType: 'silver', weightGrams: 100, price: { amount: 320, currency: 'SAR' }, stockQty: 60 },
    { title: 'سبيكة فضة 500 جرام', description: 'سبيكة فضة نقاء عالي - 500 جرام', images: [IMG.silverBar], categoryId: silverBars._id, metalType: 'silver', weightGrams: 500, price: { amount: 1600, currency: 'SAR' }, stockQty: 40 },
    { title: 'سبيكة فضة 1 كجم', description: 'سبيكة فضة نقاء عالي - 1 كجم', images: [IMG.silverBar], categoryId: silverBars._id, metalType: 'silver', weightGrams: 1000, price: { amount: 3200, currency: 'SAR' }, stockQty: 30, isFeatured: true }
  ];
  for (const p of silverProducts) await upsertProduct({ ...p, isActive: true });

  // ---- Emirates Bullion / BTC ----
  const emirates = categoryByName['Emirates Bullion / BTC'];
  const emiratesProducts = [
    { title: 'Emirates Gold Bar 10g 24K', description: 'Emirates bullion gold bar 10 grams', images: [IMG.goldBar], categoryId: emirates._id, metalType: 'gold', karat: 24, weightGrams: 10, price: { amount: 2680, currency: 'SAR' }, stockQty: 25 },
    { title: 'Emirates Gold Bar 50g 24K', description: 'Emirates bullion gold bar 50 grams', images: [IMG.goldBar2], categoryId: emirates._id, metalType: 'gold', karat: 24, weightGrams: 50, price: { amount: 13400, currency: 'SAR' }, stockQty: 15 },
    { title: 'Emirates Gold Bar 100g 24K', description: 'Emirates bullion gold bar 100 grams', images: [IMG.goldBar], categoryId: emirates._id, metalType: 'gold', karat: 24, weightGrams: 100, price: { amount: 26800, currency: 'SAR' }, stockQty: 10 }
  ];
  for (const p of emiratesProducts) await upsertProduct({ ...p, isActive: true });

  // ---- PAMP Bullion ----
  const pamp = categoryByName['PAMP Bullion'];
  const pampProducts = [
    { title: 'PAMP Suisse Fortuna 5g', description: 'PAMP Suisse Fortuna gold bar 5g', images: [IMG.goldBar], categoryId: pamp._id, metalType: 'gold', karat: 24, weightGrams: 5, price: { amount: 1380, currency: 'SAR' }, stockQty: 30 },
    { title: 'PAMP Suisse Fortuna 10g', description: 'PAMP Suisse Fortuna gold bar 10g', images: [IMG.goldBar2], categoryId: pamp._id, metalType: 'gold', karat: 24, weightGrams: 10, price: { amount: 2760, currency: 'SAR' }, stockQty: 25 },
    { title: 'PAMP Suisse Fortuna 20g', description: 'PAMP Suisse Fortuna gold bar 20g', images: [IMG.goldBar], categoryId: pamp._id, metalType: 'gold', karat: 24, weightGrams: 20, price: { amount: 5520, currency: 'SAR' }, stockQty: 20 },
    { title: 'PAMP Suisse Lady Fortuna 50g', description: 'PAMP Lady Fortuna 50g gold bar', images: [IMG.goldBar2], categoryId: pamp._id, metalType: 'gold', karat: 24, weightGrams: 50, price: { amount: 13800, currency: 'SAR' }, stockQty: 15 }
  ];
  for (const p of pampProducts) await upsertProduct({ ...p, isActive: true });

  // ---- Swiss bar ----
  const swiss = categoryByName['swiss bar'];
  const swissProducts = [
    { title: 'Swiss Gold Bar 10g 24K', description: 'Swiss refined gold bar 10g', images: [IMG.goldBar2], categoryId: swiss._id, metalType: 'gold', karat: 24, weightGrams: 10, price: { amount: 2700, currency: 'SAR' }, stockQty: 20 },
    { title: 'Swiss Gold Bar 50g 24K', description: 'Swiss refined gold bar 50g', images: [IMG.goldBar], categoryId: swiss._id, metalType: 'gold', karat: 24, weightGrams: 50, price: { amount: 13500, currency: 'SAR' }, stockQty: 15 }
  ];
  for (const p of swissProducts) await upsertProduct({ ...p, isActive: true });

  // ---- Silver (category) ----
  const silverCat = categoryByName['Silver'];
  const silverCatProducts = [
    { title: 'Silver Bar 100g', description: 'Fine silver bar 100g', images: [IMG.silverBar], categoryId: silverCat._id, metalType: 'silver', weightGrams: 100, price: { amount: 330, currency: 'SAR' }, stockQty: 50 },
    { title: 'Silver Bar 1kg', description: 'Fine silver bar 1kg', images: [IMG.silverBar], categoryId: silverCat._id, metalType: 'silver', weightGrams: 1000, price: { amount: 3300, currency: 'SAR' }, stockQty: 25 }
  ];
  for (const p of silverCatProducts) await upsertProduct({ ...p, isActive: true });

  // ---- Rings ----
  const rings = categoryByName['Rings'];
  const ringProducts = [
    { title: 'خاتم ذهب عيار 21 - كلاسيك', description: 'خاتم ذهبي عيار 21 تصميم كلاسيك', images: [IMG.ring, IMG.jewelry], categoryId: rings._id, metalType: 'gold', karat: 21, price: { amount: 1850, currency: 'SAR' }, stockQty: 20 },
    { title: 'خاتم ذهب عيار 18 - عصري', description: 'خاتم ذهبي عيار 18 تصميم عصري', images: [IMG.ring], categoryId: rings._id, metalType: 'gold', karat: 18, price: { amount: 1200, currency: 'SAR' }, stockQty: 25 }
  ];
  for (const p of ringProducts) await upsertProduct({ ...p, isActive: true });

  // ---- Bracelet ----
  const bracelet = categoryByName['Bracelet'];
  const braceletProducts = [
    { title: 'سوار ذهب عيار 21', description: 'سوار ذهبي عيار 21', images: [IMG.bracelet, IMG.chain], categoryId: bracelet._id, metalType: 'gold', karat: 21, price: { amount: 3500, currency: 'SAR' }, stockQty: 15 },
    { title: 'سوار فضة', description: 'سوار فضة أنيق', images: [IMG.silverBar], categoryId: bracelet._id, metalType: 'silver', price: { amount: 450, currency: 'SAR' }, stockQty: 30 }
  ];
  for (const p of braceletProducts) await upsertProduct({ ...p, isActive: true });

  // ---- chains ----
  const chains = categoryByName['chains'];
  const chainProducts = [
    { title: 'سلسلة ذهب عيار 21', description: 'سلسلة ذهبية عيار 21', images: [IMG.chain], categoryId: chains._id, metalType: 'gold', karat: 21, price: { amount: 2200, currency: 'SAR' }, stockQty: 18 },
    { title: 'سلسلة ذهب عيار 18', description: 'سلسلة ذهبية عيار 18', images: [IMG.chain], categoryId: chains._id, metalType: 'gold', karat: 18, price: { amount: 1500, currency: 'SAR' }, stockQty: 22 }
  ];
  for (const p of chainProducts) await upsertProduct({ ...p, isActive: true });

  // ---- Watch ----
  const watch = categoryByName['Watch'];
  const watchProducts = [
    { title: 'ساعة ذهبية فاخرة', description: 'ساعة يد ذهبية عيار 18', images: [IMG.watch], categoryId: watch._id, metalType: 'gold', karat: 18, price: { amount: 18500, currency: 'SAR' }, stockQty: 8 },
    { title: 'ساعة ذهب وفضة', description: 'ساعة ثنائية المعدن', images: [IMG.watch], categoryId: watch._id, metalType: 'gold', price: { amount: 9200, currency: 'SAR' }, stockQty: 12 }
  ];
  for (const p of watchProducts) await upsertProduct({ ...p, isActive: true });

  // ---- Diamond ----
  const diamond = categoryByName['Diamond'];
  const diamondProducts = [
    { title: 'عقد ماس 0.5 قيراط', description: 'عقد ذهب أبيض مع ماس', images: [IMG.diamond], categoryId: diamond._id, metalType: 'jewellery', price: { amount: 4500, currency: 'SAR' }, stockQty: 10 },
    { title: 'خاتم ماس 1 قيراط', description: 'خاتم خطوبة ماس 1 قيراط', images: [IMG.diamond, IMG.ring], categoryId: diamond._id, metalType: 'jewellery', price: { amount: 12000, currency: 'SAR' }, stockQty: 6 }
  ];
  for (const p of diamondProducts) await upsertProduct({ ...p, isActive: true });

  // ---- Gift Boxes ----
  const giftBoxes = categoryByName['Gift Boxes'];
  const giftProducts = [
    { title: 'صندوق هدايا سبائك 10g', description: 'صندوق هدية يحتوي سبيكة ذهب 10 جرام', images: [IMG.gift, IMG.goldBar], categoryId: giftBoxes._id, metalType: 'gold', weightGrams: 10, price: { amount: 2850, currency: 'SAR' }, stockQty: 20 },
    { title: 'صندوق هدايا فضة 100g', description: 'صندوق هدية يحتوي سبيكة فضة 100 جرام', images: [IMG.gift, IMG.silverBar], categoryId: giftBoxes._id, metalType: 'silver', weightGrams: 100, price: { amount: 420, currency: 'SAR' }, stockQty: 35 }
  ];
  for (const p of giftProducts) await upsertProduct({ ...p, isActive: true });

  // ---- Islamic ----
  const islamic = categoryByName['Islamic'];
  const islamicProducts = [
    { title: 'عملة ذهبية إسلامية 7.98g', description: 'عملة ذهبية بآيات قرآنية', images: [IMG.goldBar], categoryId: islamic._id, metalType: 'gold', karat: 24, weightGrams: 7.98, price: { amount: 2110, currency: 'SAR' }, stockQty: 25 },
    { title: 'سبيكة قرآنية 5g', description: 'سبيكة ذهبية منقوشة بآيات', images: [IMG.goldBar2], categoryId: islamic._id, metalType: 'gold', karat: 24, weightGrams: 5, price: { amount: 1320, currency: 'SAR' }, stockQty: 40 }
  ];
  for (const p of islamicProducts) await upsertProduct({ ...p, isActive: true });

  // ---- Premium Products ----
  const premium = categoryByName['Premium Products'];
  const premiumProducts = [
    { title: 'سبيكة PAMP 100g مذهبة', description: 'سبيكة PAMP Suisse 100g طبعة خاصة', images: [IMG.goldBar2], categoryId: premium._id, metalType: 'gold', karat: 24, weightGrams: 100, price: { amount: 27800, currency: 'SAR' }, stockQty: 8 },
    { title: 'مجموعة سبائك 50g x 2', description: 'مجموعة سبائك ذهب 50 جرام قطعتين', images: [IMG.goldBar, IMG.goldBar2], categoryId: premium._id, metalType: 'gold', karat: 24, weightGrams: 100, price: { amount: 26800, currency: 'SAR' }, stockQty: 12 }
  ];
  for (const p of premiumProducts) await upsertProduct({ ...p, isActive: true });

  // ---- Silver Jewellery ----
  const silverJewellery = categoryByName['Silver Jewellery'];
  const silverJewelleryProducts = [
    { title: 'عقد فضة مطلي', description: 'عقد فضة أنيق للنساء', images: [IMG.jewelry], categoryId: silverJewellery._id, metalType: 'silver', price: { amount: 280, currency: 'SAR' }, stockQty: 40 },
    { title: 'أقراط فضة', description: 'أقراط فضة كلاسيكية', images: [IMG.jewelry], categoryId: silverJewellery._id, metalType: 'silver', price: { amount: 150, currency: 'SAR' }, stockQty: 50 }
  ];
  for (const p of silverJewelleryProducts) await upsertProduct({ ...p, isActive: true });

  // ---- White Gold ----
  const whiteGold = categoryByName['White Gold'];
  const whiteGoldProducts = [
    { title: 'خاتم ذهب أبيض عيار 18', description: 'خاتم خطوبة ذهب أبيض', images: [IMG.ring], categoryId: whiteGold._id, metalType: 'gold', karat: 18, price: { amount: 2400, currency: 'SAR' }, stockQty: 15 },
    { title: 'سوار ذهب أبيض', description: 'سوار ذهب أبيض عيار 18', images: [IMG.bracelet], categoryId: whiteGold._id, metalType: 'gold', karat: 18, price: { amount: 4200, currency: 'SAR' }, stockQty: 10 }
  ];
  for (const p of whiteGoldProducts) await upsertProduct({ ...p, isActive: true });

  // ---- Kids Selection ----
  const kids = categoryByName['Kids Selection'];
  const kidsProducts = [
    { title: 'سلسلة أطفال ذهب 18', description: 'سلسلة ذهبية خفيفة للأطفال', images: [IMG.chain], categoryId: kids._id, metalType: 'gold', karat: 18, price: { amount: 650, currency: 'SAR' }, stockQty: 30 },
    { title: 'سوار أطفال فضة', description: 'سوار فضة للأطفال', images: [IMG.silverBar], categoryId: kids._id, metalType: 'silver', price: { amount: 120, currency: 'SAR' }, stockQty: 45 }
  ];
  for (const p of kidsProducts) await upsertProduct({ ...p, isActive: true });

  // ---- Remaining categories: add at least one product each ----
  const remainingCats = ['MagicWire®', 'RANCANGELO', "D'orica", 'Monaco Chain', 'Othmani Lera and Georgian', 'Disney & Marvel Collection', 'Sets', 'Bracelet & Ring', 'Sabhat', 'Frame', 'Ear Rings', 'Light Weight Collection', 'Wholesale prices'];
  for (const catName of remainingCats) {
    const cat = categoryByName[catName];
    if (!cat) continue;
    await upsertProduct({
      title: `${catName} - منتج مميز`,
      description: `منتج من فئة ${catName} - جودة عالية`,
      images: [IMG.goldBar, IMG.jewelry],
      categoryId: cat._id,
      metalType: 'gold',
      karat: 21,
      price: { amount: 1999, currency: 'SAR' },
      stockQty: 15,
      isActive: true
    });
  }

  await upsertNews({
    title: 'ارتفاع أسعار الذهب في السعودية اليوم',
    summary: 'تحديث سريع حول تحركات أسعار الذهب محليًا وعالميًا.',
    content:
      'هذا خبر تجريبي داخل المنصة. سيتم ربط الأخبار بمصدر أو لوحة إدارة لاحقًا.\n\nيمكنك نشر/إخفاء الأخبار وإدارتها من لوحة الإدارة لاحقًا.',
    language: 'ar',
    coverImage: '',
    publishedAt: new Date()
  });

  console.log('Seed complete.');

  const [products, categories] = await Promise.all([
    Product.countDocuments({}),
    Category.countDocuments({})
  ]);

  // Disconnect only when we connected inside this function (CLI use)
  if (shouldConnect) {
    await mongoose.disconnect().catch(() => {});
  }

  return { products, categories };
}

// CLI usage: `node backend/scripts/seedKsaStore.js`
if (require.main === module) {
  seedStore({ connectIfNeeded: true })
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e?.message || e);
      process.exit(1);
    });
}

module.exports = { seedStore };

