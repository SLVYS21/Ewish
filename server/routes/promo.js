const router = require('express').Router();
const Promo = require('../models/Promo');
const { requireAdmin } = require('../middleware/auth');

// POST /api/promo/validate — public, validate a promo code
router.post('/validate', async (req, res) => {
  try {
    const { code, templateName, amount } = req.body;
    if (!code) return res.status(400).json({ error: 'Code requis' });

    const promo = await Promo.findOne({ code: code.toUpperCase() });
    if (!promo) return res.status(404).json({ error: 'Code introuvable' });

    // Template restriction
    if (promo.templates.length > 0 && !promo.templates.includes(templateName)) {
      return res.status(400).json({ error: 'Ce code ne s\'applique pas à ce template' });
    }

    const check = promo.isValid(amount || 0);
    if (!check.ok) return res.status(400).json({ error: check.reason });

    const discount = promo.computeDiscount(amount || 0);
    res.json({
      valid: true,
      code: promo.code,
      type: promo.type,
      value: promo.value,
      discount,
      finalPrice: Math.max(0, (amount || 0) - discount),
      description: promo.description,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Admin CRUD ──
router.get('/', requireAdmin, async (req, res) => {
  try {
    const promos = await Promo.find().sort('-createdAt').lean();
    res.json(promos);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const promo = await Promo.create(req.body);
    res.status(201).json(promo);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const promo = await Promo.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!promo) return res.status(404).json({ error: 'Not found' });
    res.json(promo);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await Promo.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;