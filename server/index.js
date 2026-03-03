require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true, // needed for httpOnly cookies
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Template static assets
app.use('/site/birthday',          express.static(path.join(__dirname, '../templates/birthday')));
app.use('/site/special',           express.static(path.join(__dirname, '../templates/special')));
app.use('/site/collective-family', express.static(path.join(__dirname, '../templates/collective-family')));
app.use('/site/collective-pro',    express.static(path.join(__dirname, '../templates/collective-pro')));

// ── Public routes ──
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/templates',  require('./routes/templates'));
app.use('/api/orders',     require('./routes/orders'));
app.use('/api/promo',      require('./routes/promo'));
app.use('/api/upload',     require('./routes/upload'));
app.use('/api/track',      require('./routes/analytics'));  // POST for client-side tracking
app.use('/api/wishes',     require('./routes/wishes'));

// Collect page (public wish submission)
app.use('/collect', require('./routes/collect'));

// ── Admin-protected routes ──
app.use('/api/publications', require('./routes/publication'));
app.use('/api/analytics',    require('./routes/analytics'));  // GET for dashboard

// Preview (demo mode, protected)
app.use('/preview', require('./routes/preview'));

// Admin panel — served as static HTML, no link from landing
// app.use('/ww-admin', require('./routes/admin'));

// ── Published sites ──
app.use('/site', require('./routes/serve'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date(), version: '2.0.0' }));

// Connect MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wishwell';
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 eWishWell server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} (no DB)`));
  });

module.exports = app;