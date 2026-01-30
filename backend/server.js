// Gold backend — deploy from GitHub main (no useNewUrlParser; MONGODB_URI required on Railway)
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

// Load .env from backend directory (works when run from project root or backend/)
dotenv.config({ path: path.join(__dirname, '.env') });

// If you see this in Railway logs = latest code is running (no useNewUrlParser, duplicate indexes fixed)
console.log('[Gold] Backend started — Mongo driver 4+ (no useNewUrlParser). Set MONGODB_URI on Railway.');

const app = express();

// Railway (and most reverse proxies) send X-Forwarded-For — trust proxy so rate-limit gets real client IP
app.set('trust proxy', 1);

// CORS — one service on Railway: same origin; CORS_ORIGIN=* allows all (e.g. if you add a separate frontend later)
const corsOrigin = process.env.CORS_ORIGIN;
const corsOpts = corsOrigin === '*' || !corsOrigin
  ? {}
  : { origin: corsOrigin };
app.use(cors(corsOpts));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting (Railway: all requests counted; no skip by IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 500 : 10000,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Required: MONGODB_URI always; JWT_SECRET in production (Railway Variables)
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('MONGODB_URI is required. Set it in Railway Variables.');
  process.exit(1);
}
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('JWT_SECRET is required in production. Set it in Railway Variables.');
  process.exit(1);
}
mongoose.connect(mongoUri)
.then(() => console.log('MongoDB connected'))
.catch(err => {
  console.error('MongoDB connection error:', err.message || err);
  process.exit(1);
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/trade', require('./routes/trade'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/delivery', require('./routes/delivery'));
app.use('/api/pricing', require('./routes/pricing'));
app.use('/api/store', require('./routes/store'));
app.use('/api/news', require('./routes/news'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// DB check (safe, no secrets): confirms Railway sees Atlas + data counts
app.get('/api/health/db', async (req, res) => {
  try {
    const readyState = mongoose.connection.readyState; // 0..3
    const state =
      readyState === 0 ? 'disconnected'
      : readyState === 1 ? 'connected'
      : readyState === 2 ? 'connecting'
      : readyState === 3 ? 'disconnecting'
      : 'unknown';

    // Lazy-require models so this endpoint doesn't affect startup order
    const Product = require('./models/Product');
    const Category = require('./models/Category');

    const [products, categories, sample] = await Promise.all([
      Product.countDocuments({}),
      Category.countDocuments({}),
      Product.find({})
        .sort({ createdAt: -1 })
        .limit(3)
        .select('_id title slug categoryId isActive createdAt')
        .lean()
    ]);

    return res.json({
      ok: true,
      timestamp: new Date(),
      mongo: {
        state,
        readyState,
        dbName: mongoose.connection?.db?.databaseName || mongoose.connection?.name || null
      },
      counts: { products, categories },
      sampleProducts: Array.isArray(sample) ? sample : []
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      timestamp: new Date(),
      error: error?.message || String(error)
    });
  }
});

// One-off seeding for production DB (protected by SEED_SECRET)
let seedInProgress = false;
app.post('/api/internal/seed/store', async (req, res) => {
  try {
    const secret = process.env.SEED_SECRET;
    if (!secret) return res.status(404).json({ ok: false, message: 'Not found' });

    const provided = String(req.get('x-seed-secret') || req.query.secret || '').trim();
    if (!provided || provided !== secret) {
      return res.status(401).json({ ok: false, message: 'Unauthorized' });
    }

    if (seedInProgress) {
      return res.status(409).json({ ok: false, message: 'Seed already running' });
    }
    seedInProgress = true;

    const { seedStore } = require('./scripts/seedKsaStore');
    const result = await seedStore({ connectIfNeeded: false });

    return res.json({ ok: true, ...result });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error?.message || String(error) });
  } finally {
    seedInProgress = false;
  }
});

// Production: serve built frontend (React) so GET / returns the app
if (process.env.NODE_ENV === 'production') {
  const clientBuild = path.join(__dirname, '../frontend/build');
  const fs = require('fs');
  if (fs.existsSync(clientBuild)) {
    app.use(express.static(clientBuild, { index: false }));
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientBuild, 'index.html'));
    });
  }
}

// Start price updater service
const { startPriceUpdater } = require('./services/priceUpdater');
const MerchantSettings = require('./models/MerchantSettings');

// Initialize price updater after DB connection
mongoose.connection.once('open', async () => {
  try {
    // Auto-seed store catalog once in production if DB is empty (safe bootstrap)
    // Disable by setting DISABLE_AUTO_SEED_STORE=true in Railway Variables.
    if (
      process.env.NODE_ENV === 'production' &&
      String(process.env.DISABLE_AUTO_SEED_STORE || '').toLowerCase() !== 'true'
    ) {
      try {
        const Product = require('./models/Product');
        const Category = require('./models/Category');
        const [products, categories] = await Promise.all([
          Product.countDocuments({}),
          Category.countDocuments({})
        ]);

        if (products === 0 && categories === 0) {
          console.log('[Seed] Store DB empty — running initial seed...');
          const { seedStore } = require('./scripts/seedKsaStore');
          const seeded = await seedStore({ connectIfNeeded: false });
          console.log(`[Seed] Done. products=${seeded?.products ?? '?'} categories=${seeded?.categories ?? '?'}`);
        }
      } catch (e) {
        console.warn('[Seed] Auto-seed skipped/failed:', e?.message || e);
      }
    }

    const settings = await MerchantSettings.getSettings();
    const interval = settings.priceUpdateInterval || 30;
    startPriceUpdater(interval);
    console.log(`Price updater started (interval: ${interval}s)`);
  } catch (error) {
    console.error('Error starting price updater:', error);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
