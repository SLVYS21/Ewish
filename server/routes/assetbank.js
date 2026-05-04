const router  = require('express').Router();
const cloudinary = require('cloudinary').v2;
const multer  = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { requireSuperAdmin, requireAdmin } = require('../middleware/auth');
const AssetBank = require('../models/AssetBank');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage — different folders per type
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req) => {
    const isBackground = req.body?.type === 'background' || req.query?.type === 'background';
    return {
      folder:        isBackground ? 'ewishwell/bank-backgrounds' : 'ewishwell/bank-decorations',
      resource_type: 'image',
      public_id:     `bank-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      transformation: isBackground
        ? [{ width: 1920, height: 1080, crop: 'limit', quality: 80, fetch_format: 'webp' }]
        : [{ quality: 'auto:good', fetch_format: 'auto' }],
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const ok = file.mimetype.startsWith('image/');
    cb(ok ? null : new Error('Images uniquement'), ok);
  },
});

/* ── GET /api/assets?type=background|decoration ── Public (tous les marchands) */
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { type, tags } = req.query;
    const query = {};
    if (type && ['background', 'decoration'].includes(type)) query.type = type;
    if (tags) query.tags = { $in: tags.split(',') };

    const assets = await AssetBank.find(query)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    res.json(assets);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── POST /api/assets ── Upload (super_admin seulement) */
router.post('/', requireSuperAdmin, (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier' });

    try {
      const { type = 'decoration', name = '', tags = '' } = req.body;
      const asset = await AssetBank.create({
        type: ['background', 'decoration'].includes(type) ? type : 'decoration',
        name: name || req.file.originalname,
        url:  req.file.path,
        publicId: req.file.filename,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        addedBy: req.admin.id,
      });
      res.status(201).json(asset);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
});

/* ── PUT /api/assets/:id ── Modifier nom/tags (super_admin) */
router.put('/:id', requireSuperAdmin, async (req, res) => {
  try {
    const { name, tags } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (tags !== undefined) update.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());

    const asset = await AssetBank.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!asset) return res.status(404).json({ error: 'Asset introuvable' });
    res.json(asset);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── DELETE /api/assets/:id ── Supprimer (super_admin) */
router.delete('/:id', requireSuperAdmin, async (req, res) => {
  try {
    const asset = await AssetBank.findById(req.params.id);
    if (!asset) return res.status(404).json({ error: 'Asset introuvable' });

    // Remove from Cloudinary
    if (asset.publicId) {
      try { await cloudinary.uploader.destroy(asset.publicId); } catch {}
    }

    await AssetBank.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
