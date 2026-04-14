require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const path         = require('path');
const fs           = require('fs');
const mongoose     = require('mongoose');
const cookieParser = require('cookie-parser');

const app  = express();
const PORT = process.env.PORT || 5000;
const PROD = process.env.NODE_ENV === 'production';

// Domains (override via .env)
const WWW_HOST = process.env.WWW_HOST || 'www.mykado.store';   // landing
const LANDING_URL  = process.env.LANDING_URL  || `https://${'www.mykado.store'}`;
const APP_HOST = process.env.APP_HOST || 'app.mykado.store';   // React app

// ── CORS ─────────────────────────────────────────────────────
// Allow both subdomains in production, Vite dev server locally
// Extra origins from env (e.g. DO static site: https://ewish-xxx.ondigitalocean.app)
const EXTRA_ORIGINS = process.env.EXTRA_ORIGINS ? process.env.EXTRA_ORIGINS.split(',') : [];

const ALLOWED_ORIGINS = PROD
  ? [`https://${WWW_HOST}`, `https://${APP_HOST}`, 'https://ewish-nxe6b.ondigitalocean.app', 'https://app.mykado.store', 'https://go.mykado.store',...EXTRA_ORIGINS]
  : ['http://localhost:3000', 'http://localhost:5000', 'https://ewish-nxe6b.ondigitalocean.app', 'https://app.mykado.store'];

app.use(cors({
  origin: (origin, cb) => {
    // Allow same-origin and listed origins
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    // In dev also allow any localhost
    if (!PROD && origin && origin.includes('localhost')) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,   // Required for cookies cross-domain
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const TEMPLATES_DIR = process.env.TEMPLATES_DIR ||
  (fs.existsSync(path.join(__dirname, 'templates')) 
    ? path.join(__dirname, 'templates')
    : path.join(__dirname, '../templates'));

app.use('/templates/shared',       express.static(path.join(TEMPLATES_DIR, 'shared')));

// ── Template static assets ────────────────────────────────────
app.use('/site/birthday',          express.static(path.join(TEMPLATES_DIR, 'birthday')));
app.use('/site/special',           express.static(path.join(TEMPLATES_DIR, 'special')));
app.use('/site/collective-family', express.static(path.join(TEMPLATES_DIR, 'collective-family')));
app.use('/site/collective-pro',    express.static(path.join(TEMPLATES_DIR, 'collective-pro')));

// ── API (shared, accessible from both subdomains) ─────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/templates',    require('./routes/templates'));
//app.use('/api/orders',       require('./routes/orders'));
app.use('/api/orders',       require('./routes/order-public'));
app.use('/api/promo',        require('./routes/promo'));
app.use('/api/upload',       require('./routes/upload'));
app.use('/api/track',        require('./routes/analytics'));
app.use('/api/wishes',       require('./routes/wishes'));
app.use('/api/publications',  require('./routes/publication'));
app.use('/api/analytics',    require('./routes/analytics'));
app.use('/api/shortlinks',   require('./routes/shortlinks'));
app.use('/api/fonts',        require('./routes/fonts.js'));

app.use('/collect', require('./routes/collect'));
app.use('/s',       require('./routes/shortlinks'));
app.use('/preview', require('./routes/preview'));
app.use('/site',    require('./routes/serve'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '2.0.0' }));

// ── Landing page (www subdomain) ──────────────────────────────
// In production this route is hit directly via Express.
// In dev it also serves localhost:5000/ for convenience.
const LANDING_PATH = path.join(__dirname, '../landing/index.html');

function serveLanding(req, res) {
  if (!fs.existsSync(LANDING_PATH)) {
    return res.status(404).send('Landing not found.');
  }
  let html = fs.readFileSync(LANDING_PATH, 'utf8');
  html = html.replace(/\{\{FB_PIXEL_ID\}\}/g, process.env.FB_PIXEL_ID || '');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.send(html);
}

// ── React SPA (app subdomain, prod only) ──────────────────────
// In prod, Nginx proxies app.ewishwell.com → Express, or you can
// serve the Vite build directly from Express as shown here.
// In dev, Vite handles app.localhost:3000 — Express just responds
// with a helpful message if you hit :5000 directly.
const REACT_DIST = path.join(__dirname, '../client/dist');

function serveReact(req, res) {
  if (!PROD) {
    return res.redirect(`http://localhost:3000${req.path}`);
  }
  if (!fs.existsSync(REACT_DIST)) {
    return res.status(503).send('React app not built. Run: cd client && npm run build');
  }
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(path.join(REACT_DIST, 'index.html'));
}

// ── Host-based routing ────────────────────────────────────────
// Runs AFTER all shared API/static routes above.
// In prod: routes by Host header.
// In dev: localhost:5000 → landing, localhost:3000 → React (via Vite).
app.use((req, res, next) => {
  const host = req.hostname; // hostname strips port

  // Already handled by API routes above if path starts with /api, /site, etc.
  // This middleware only fires for unmatched paths (i.e., the root SPA/landing).

  const isAppHost = host === APP_HOST || host === 'localhost' && req.get('x-app') === '1';
  const isWwwHost = host === WWW_HOST || (!PROD && host === 'localhost');

  if (PROD && isAppHost) {
    // Serve React static assets
    express.static(REACT_DIST, { maxAge: '1y', immutable: true })(req, res, () => {
      serveReact(req, res);
    });
  } else if (isWwwHost) {
    serveLanding(req, res);
  } else if (!PROD) {
    // Dev fallback: anything hitting Express root → landing
    serveLanding(req, res);
  } else {
    next();
  }
});

// SPA catch-all for React routes in prod (e.g. /admin, /edit/:id)
if (PROD && fs.existsSync(REACT_DIST)) {
  app.use('/app', express.static(REACT_DIST, { maxAge: '1y', immutable: true }));
  app.get('*', (req, res, next) => {
    const host = req.hostname;
    if (host === APP_HOST) {
      res.setHeader('Cache-Control', 'no-store');
      res.sendFile(path.join(REACT_DIST, 'index.html'));
    } else {
      next();
    }
  });
}

app.use((req, res) => {
  // Ne pas rediriger les requêtes API (retourner 404 JSON)
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Route introuvable' });
  }
  res.redirect(302, LANDING_URL);
});

// ── MongoDB + start ───────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wishwell';
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`\n🚀 myKado server on :${PORT}`);
      if (PROD) {
        console.log(`   Landing  →  https://${WWW_HOST}`);
        console.log(`   App      →  https://${APP_HOST}`);
      } else {
        console.log(`   Landing  →  http://localhost:${PORT}/`);
        console.log(`   App      →  http://localhost:3000/  (Vite)`);
        console.log(`   Admin    →  http://localhost:3000/admin`);
      }
    });
  })
  .catch(err => {
    console.error('❌ MongoDB error:', err.message);
    app.listen(PORT, () => console.log(`🚀 Server on :${PORT} (no DB)`));
  });

module.exports = app;