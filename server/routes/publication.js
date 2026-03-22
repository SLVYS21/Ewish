const router = require('express').Router();
const Publication = require('../models/Publication');
const slugify = require('slugify');

// GET all
router.get('/', async (req, res) => {
  try {
    const pubs = await Publication.find({}).sort('-updatedAt').lean();
    res.json(pubs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET by templateName + customName
router.get('/:templateName/:customName', async (req, res) => {
  try {
    const pub = await Publication.findOne({
      templateName: req.params.templateName,
      customName:   req.params.customName,
    }).lean();
    if (!pub) return res.status(404).json({ error: 'Not found' });
    res.json(pub);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST create
router.post('/', async (req, res) => {
  try {
    const { templateName, customName, title, data, style, jarConfig } = req.body;
    const slug = slugify(customName || title || 'wish', { lower: true, strict: true });
    const pub = await Publication.create({ templateName, customName: slug, title, data, style, jarConfig });
    res.status(201).json(pub);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'This custom name is already taken.' });
    res.status(400).json({ error: e.message });
  }
});

// PATCH update (save draft)
// - data   : shallow-merged (preserves keys not sent)
// - style  : shallow-merged
// - jarConfig : replaced entirely when present (it's a self-contained object)
router.patch('/:id', async (req, res) => {
  try {
    const { data, style, jarConfig, decorations, widgets, photoTransforms, showBranding, brandingUrl, ...rest } = req.body;
 
    const existing = await Publication.findById(req.params.id).lean();
    if (!existing) return res.status(404).json({ error: 'Not found' });
 
    // style: shallow merge but backgrounds sub-object merges deeply
    let mergedStyle = existing.style || {};
    if (style) {
      const { backgrounds: newBgs, ...flatStyle } = style;
      mergedStyle = { ...mergedStyle, ...flatStyle };
      if (newBgs !== undefined) {
        // backgrounds: merge per-section keys so you can update one section
        // without wiping others
        mergedStyle.backgrounds = { ...(mergedStyle.backgrounds || {}), ...newBgs };
      }
    }
 
    const update = {
      ...rest,
      data:  data  ? { ...existing.data, ...data } : existing.data,
      style: mergedStyle,
      updatedAt: Date.now(),
    };
    // Branding fields (direct update)
    if (showBranding !== undefined) update.showBranding = showBranding;
    if (brandingUrl  !== undefined) update.brandingUrl  = brandingUrl;
 
    // jarConfig: replace entirely (nested arrays don't merge well)
    if (jarConfig !== undefined) {
      update.jarConfig = jarConfig;
    }
 
    // decorations: replace entirely (client sends full array)
    if (decorations !== undefined) {
      update.decorations = decorations;
    }
    if (widgets !== undefined) {
      update.widgets = widgets;
    }
    if (photoTransforms !== undefined) {
      update.photoTransforms = photoTransforms;
    }
 
    const pub = await Publication.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(pub);
  } catch (e) { res.status(400).json({ error: e.message }); }
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
 
    // Auto-generate shortCode on first publish
    if (!pub.shortCode) {
      try {
        const { nanoid } = require('nanoid');
        const slugify = require('slugify');
        // Try slug from name + template
        const name = pub.data?.name || pub.data?.recipientName || '';
        const occasion = pub.templateName?.replace('collective-', '') || '';
        const raw = [name, occasion].filter(Boolean).join('-');
        const slug = slugify(raw, { lower: true, strict: true }).slice(0, 30);
        let code = null;
        if (slug && slug.length >= 2) {
          const taken = await Publication.findOne({ shortCode: slug, _id: { $ne: pub._id } }).lean();
          if (!taken) code = slug;
        }
        if (!code) {
          // Random fallback with collision check
          for (let i = 0; i < 10; i++) {
            const c = nanoid(6);
            const exists = await Publication.findOne({ shortCode: c }).lean();
            if (!exists) { code = c; break; }
          }
        }
        if (code) {
          pub.shortCode = code;
          await pub.save();
        }
      } catch (e) { console.warn('shortCode generation failed:', e.message); }
    }
 
    res.json({ ...pub.toObject(), url: `/site/${pub.templateName}/${pub.customName}` });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.post('/:id/duplicate', async (req, res) => {
  try {
    const original = await Publication.findById(req.params.id).lean();
    if (!original) return res.status(404).json({ error: 'Publication introuvable' });
 
    const { customName, title } = req.body;
    if (!customName || !title) return res.status(400).json({ error: 'customName et title requis' });
 
    const slug = slugify(customName, { lower: true, strict: true });
 
    // Copy all fields except _id, shortCode, publishedAt, published
    const clone = await Publication.create({
      templateName:    original.templateName,
      customName:      slug,
      title:           title,
      data:            original.data || {},
      style:           original.style || {},
      decorations:     original.decorations || [],
      jarConfig:       original.jarConfig || null,
      widgets:         original.widgets || [],
      photoTransforms: original.photoTransforms || {},
      published:       false,
    });
 
    res.status(201).json(clone);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'Ce nom est déjà utilisé.' });
    res.status(400).json({ error: e.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await Publication.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

module.exports = router;