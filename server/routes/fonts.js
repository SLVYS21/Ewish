const router     = require('express').Router();
const cloudinary = require('cloudinary').v2;
const multer     = require('multer');
const Font       = require('../models/Font');
const { requireAdmin } = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Extension → format string for @font-face
const MIME_TO_FORMAT = {
  'font/woff2':              'woff2',
  'font/woff':               'woff',
  'font/ttf':                'truetype',
  'font/otf':                'opentype',
  'application/font-woff2':  'woff2',
  'application/font-woff':   'woff',
  'application/x-font-ttf':  'truetype',
  'application/x-font-otf':  'opentype',
  'application/octet-stream':'truetype', // .ttf often comes as this
};

// Multer — memory storage (we'll upload to Cloudinary manually for raw files)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    const allowed = Object.keys(MIME_TO_FORMAT);
    // Also allow by extension if mime is wrong
    const ext = file.originalname.split('.').pop().toLowerCase();
    const okExt = ['woff2', 'woff', 'ttf', 'otf'].includes(ext);
    if (allowed.includes(file.mimetype) || okExt) return cb(null, true);
    cb(new Error(`Format non supporté: ${file.mimetype}`));
  },
});

/* ── GET /api/fonts — list all custom fonts ─────────────────── */
router.get('/', async (req, res) => {
  try {
    const fonts = await Font.find({}).sort('-createdAt').lean();
    res.json(fonts);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── POST /api/fonts — upload a font file ───────────────────── */
router.post('/', requireAdmin, (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier' });

    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Nom de la font requis' });

    // Detect format
    const ext = req.file.originalname.split('.').pop().toLowerCase();
    const extToFormat = { woff2: 'woff2', woff: 'woff', ttf: 'truetype', otf: 'opentype' };
    const format = MIME_TO_FORMAT[req.file.mimetype] || extToFormat[ext] || 'truetype';

    try {
      // Upload as raw resource to Cloudinary (no image transformations)
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder:        'ewishwell/fonts',
            resource_type: 'raw',
            public_id:     `${Date.now()}-${name.trim().replace(/\s+/g, '-').toLowerCase()}`,
            use_filename:  false,
          },
          (error, result) => error ? reject(error) : resolve(result)
        );
        stream.end(req.file.buffer);
      });

      // Save to DB
      const font = await Font.create({
        name:   name.trim(),
        url:    result.secure_url,
        format,
      });

      res.status(201).json(font);
    } catch (e) {
      if (e.code === 11000) return res.status(409).json({ error: 'Une font avec ce nom existe déjà' });
      res.status(500).json({ error: e.message });
    }
  });
});

/* ── DELETE /api/fonts/:id ───────────────────────────────────── */
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const font = await Font.findById(req.params.id);
    if (!font) return res.status(404).json({ error: 'Not found' });

    // Delete from Cloudinary too (extract public_id from URL)
    try {
      const parts  = font.url.split('/');
      const file   = parts.pop().split('.')[0];   // filename without extension
      const folder = parts.slice(parts.indexOf('ewishwell')).join('/');
      await cloudinary.uploader.destroy(`${folder}/${file}`, { resource_type: 'raw' });
    } catch {}  // Non-blocking — DB delete still happens

    await Font.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;