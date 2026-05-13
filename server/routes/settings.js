const router = require('express').Router();
const { requireSuperAdmin } = require('../middleware/auth');
const SiteSettings = require('../models/SiteSettings');

const DEFAULTS = {
  wa_support_phone:   '+2290159571057',
  wa_support_message: 'Bonjour myKado 👋 J\'ai besoin d\'aide !',
};

/* ── GET /api/settings  — Public (used by FAB, templates, etc.) */
router.get('/', async (req, res) => {
  try {
    const docs = await SiteSettings.find({}).lean();
    const settings = { ...DEFAULTS };
    docs.forEach(d => { settings[d.key] = d.value; });
    res.json(settings);
  } catch (e) {
    res.json(DEFAULTS); // safe fallback
  }
});

/* ── PUT /api/settings  — Super Admin only */
router.put('/', requireSuperAdmin, async (req, res) => {
  try {
    const allowed = ['wa_support_phone', 'wa_support_message'];
    const ops = allowed
      .filter(k => req.body[k] !== undefined)
      .map(k => SiteSettings.findOneAndUpdate(
        { key: k },
        { key: k, value: req.body[k] },
        { upsert: true, new: true }
      ));
    await Promise.all(ops);
    const docs = await SiteSettings.find({}).lean();
    const result = { ...DEFAULTS };
    docs.forEach(d => { result[d.key] = d.value; });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
