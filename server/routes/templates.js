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



module.exports = router;