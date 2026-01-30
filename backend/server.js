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
