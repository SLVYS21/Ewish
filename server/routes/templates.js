const router = require('express').Router();
const Template = require('../models/Template');

// GET all templates
router.get('/', async (req, res) => {
  try {
    const templates = await Template.find({}, '-__v').lean();
    res.json(templates);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET single template by name
router.get('/:name', async (req, res) => {
  try {
    const template = await Template.findOne({ name: req.params.name }).lean();
    if (!template) return res.status(404).json({ error: 'Template not found' });
    res.json(template);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST create/upsert template (used by seed script)
router.post('/', async (req, res) => {
  try {
    const template = await Template.findOneAndUpdate(
      { name: req.body.name },
      req.body,
      { upsert: true, new: true }
    );
    res.status(201).json(template);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// PATCH /api/templates/:name — admin update (price, description, highlights…)
const { requireAdmin } = require('../middleware/auth');
router.patch('/:name', requireAdmin, async (req, res) => {
  try {
    const allowed = ['label','price','priceLabel','description','highlights','active','featured','tags','sortOrder'];
    const update = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
    const template = await Template.findOneAndUpdate(
      { name: req.params.name },
      { $set: update },
      { new: true }
    );
    if (!template) return res.status(404).json({ error: 'Template not found' });
    res.json(template);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});


module.exports = router;