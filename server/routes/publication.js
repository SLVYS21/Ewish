const router = require('express').Router();
const Publication = require('../models/Publication');
const slugify = require('slugify');

// GET all publications
router.get('/', async (req, res) => {
  try {
    const pubs = await Publication.find({}).sort('-updatedAt').lean();
    res.json(pubs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET by templateName + customName
router.get('/:templateName/:customName', async (req, res) => {
  try {
    const pub = await Publication.findOne({
      templateName: req.params.templateName,
      customName: req.params.customName,
    }).lean();
    if (!pub) return res.status(404).json({ error: 'Not found' });
    res.json(pub);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST create new publication
router.post('/', async (req, res) => {
  try {
    const { templateName, customName, title, data, style } = req.body;
    const slug = slugify(customName || title || 'wish', { lower: true, strict: true });

    const pub = await Publication.create({ templateName, customName: slug, title, data, style });
    res.status(201).json(pub);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'This custom name is already taken for this template.' });
    res.status(400).json({ error: e.message });
  }
});

// PATCH update (save draft)
router.patch('/:id', async (req, res) => {
  try {
    const pub = await Publication.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!pub) return res.status(404).json({ error: 'Not found' });
    res.json(pub);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// POST publish
router.post('/:id/publish', async (req, res) => {
  try {
    const pub = await Publication.findByIdAndUpdate(
      req.params.id,
      { published: true, publishedAt: Date.now() },
      { new: true }
    );
    if (!pub) return res.status(404).json({ error: 'Not found' });
    res.json({
      ...pub.toObject(),
      url: `/site/${pub.templateName}/${pub.customName}`,
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await Publication.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;