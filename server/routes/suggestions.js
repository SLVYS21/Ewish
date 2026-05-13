const router = require('express').Router();
const { requireSuperAdmin, requireAdmin } = require('../middleware/auth');
const Suggestion = require('../models/Suggestion');

/* ── POST /api/suggestions  — Create a suggestion (any auth user) */
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { category, message, authorName } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Message requis' });
    const sug = await Suggestion.create({
      merchantId:  req.user.merchantId || req.user._id,
      authorName:  authorName || req.user.name || 'Anonyme',
      authorEmail: req.user.email,
      category:    category || 'feature',
      message:     message.trim().slice(0, 1000),
    });
    res.status(201).json(sug);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── GET /api/suggestions/mine — own suggestions */
router.get('/mine', requireAdmin, async (req, res) => {
  try {
    const id = req.user.merchantId || req.user._id;
    const sugs = await Suggestion.find({ merchantId: id }).sort({ createdAt: -1 }).limit(50).lean();
    res.json(sugs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── GET /api/suggestions  — All suggestions (super_admin only) */
router.get('/', requireSuperAdmin, async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') return res.status(403).json({ error: 'Accès refusé' });
    const { status, page = 1, limit = 50 } = req.query;
    const filter = status ? { status } : {};
    const [items, total] = await Promise.all([
      Suggestion.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)).lean(),
      Suggestion.countDocuments(filter),
    ]);
    res.json({ items, total });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── PATCH /api/suggestions/:id — Update status/note (super_admin) */
router.patch('/:id', requireSuperAdmin, async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') return res.status(403).json({ error: 'Accès refusé' });
    const { status, adminNote } = req.body;
    const update = {};
    if (status)    update.status    = status;
    if (adminNote !== undefined) update.adminNote = adminNote;
    const sug = await Suggestion.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!sug) return res.status(404).json({ error: 'Non trouvé' });
    res.json(sug);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── DELETE /api/suggestions/:id — super_admin */
router.delete('/:id', requireSuperAdmin, async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') return res.status(403).json({ error: 'Accès refusé' });
    await Suggestion.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
