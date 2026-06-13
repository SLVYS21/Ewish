const router = require('express').Router();
const Publication = require('../models/Publication');
const AdminUser = require('../models/AdminUser');
const Template = require('../models/Template');
const slugify = require('slugify');
const { requireAdmin, requireOptionalAdmin } = require('../middleware/auth');

// GET all
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { limit = 20, page = 1, search, premade, mine } = req.query;
    const query = {};
    
    if (premade === 'true') {
      query.isPremade = true;
    } else if (mine === 'true') {
      query.merchantId = req.admin.merchantId;
      query.isPremade = { $ne: true };
    } else if (req.admin.role === 'merchant') {
      query.$or = [
        { merchantId: req.admin.merchantId },
        { isPremade: true }
      ];
    } else if (req.query.premade === 'true') { // legacy fallback
      query.isPremade = true;
    }

    if (search) {
      const searchFilter = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { customName: { $regex: search, $options: 'i' } },
          { shortCode: { $regex: search, $options: 'i' } },
          { 'data.name': { $regex: search, $options: 'i' } },
          { 'data.recipientName': { $regex: search, $options: 'i' } },
          { 'data.recipient': { $regex: search, $options: 'i' } },
          { 'data.occasion': { $regex: search, $options: 'i' } },
        ]
      };
      if (query.$or) {
        query.$and = [{ $or: query.$or }, searchFilter];
        delete query.$or;
      } else {
        Object.assign(query, searchFilter);
      }
    }

    if (req.query.templateName) {
      query.templateName = req.query.templateName;
    }

    if (req.query.published === 'true') {
      query.published = true;
    } else if (req.query.published === 'false') {
      query.published = false;
    }

    const pubs = await Publication.find(query).sort('-updatedAt').skip((page - 1) * limit).limit(Number(limit)).lean();
    res.json(pubs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET by MongoDB ID
router.get('/id/:id', requireAdmin, async (req, res) => {
  try {
    const pub = await Publication.findById(req.params.id).lean();
    if (!pub) return res.status(404).json({ error: 'Not found' });
    if (req.admin.role === 'merchant' && pub.merchantId !== req.admin.merchantId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    res.json(pub);
  } catch (e) { res.status(500).json({ error: e.message }); }
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
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST create
router.post('/', requireOptionalAdmin, async (req, res) => {
  try {
    const { templateName, customName, title, data, style, jarConfig } = req.body;
    
    if (req.admin?.role === 'merchant') {
      const template = await Template.findOne({ name: templateName }).lean();
      if (!template) return res.status(404).json({ error: 'Template introuvable' });
    }

    const slug = slugify(customName || title || 'wish', { lower: true, strict: true });
    const merchantId = req.admin?.role === 'merchant' ? req.admin.merchantId : undefined;
    
    const createData = { templateName, customName: slug, title, data, style, jarConfig, merchantId };
    if (req.admin?.role === 'super_admin') {
      if (req.body.isPremade !== undefined) createData.isPremade = req.body.isPremade;
      if (req.body.premadeLabel !== undefined) createData.premadeLabel = req.body.premadeLabel;
    }

    const pub = await Publication.create(createData);
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
router.patch('/:id', requireOptionalAdmin, async (req, res) => {
  try {
    const { data, style, jarConfig, decorations, widgets, photoTransforms, showBranding, brandingUrl, brandingText,...rest } = req.body;

    const existing = await Publication.findById(req.params.id).lean();
    if (!existing) return res.status(404).json({ error: 'Not found' });
    if (req.admin?.role === 'merchant' && existing.merchantId !== req.admin.merchantId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

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
      data: data ? { ...existing.data, ...data, ...{'ib-name': data.name} } : existing.data,
      style: mergedStyle,
      updatedAt: Date.now(),
    };
    // Branding fields (direct update)
    if (showBranding !== undefined) update.showBranding = showBranding;
    if (brandingUrl !== undefined) update.brandingUrl = brandingUrl;
    if (brandingText !== undefined) update.brandingText = brandingText;

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
router.post('/:id/publish', requireOptionalAdmin, async (req, res) => {
  try {
    const existing = await Publication.findById(req.params.id).lean();
    if (!existing) return res.status(404).json({ error: 'Not found' });
    if (req.admin?.role === 'merchant' && existing.merchantId !== req.admin.merchantId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    // Credit deduction for merchants
    if (req.admin?.role === 'merchant' && !existing.isPaid) {
      const template = await Template.findOne({ name: existing.templateName }).lean();
      const creditsReq = template?.creditsRequired || 1;
      const user = await AdminUser.findById(req.admin.id);
      
      if (user.credits < creditsReq) {
        return res.status(402).json({ error: `Crédits insuffisants. Il vous faut ${creditsReq} crédits pour publier cette création.`, creditsRequired: creditsReq });
      }
      
      user.credits -= creditsReq;
      await user.save();
      // Mark as paid so we don't deduct again
      await Publication.findByIdAndUpdate(req.params.id, { isPaid: true });
    }

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

router.post('/:id/duplicate', requireOptionalAdmin, async (req, res) => {
  try {
    const original = await Publication.findById(req.params.id).lean();
    if (!original) return res.status(404).json({ error: 'Publication introuvable' });

    if (req.admin?.role === 'merchant') {
      const template = await Template.findOne({ name: original.templateName }).lean();
      if (!template) return res.status(404).json({ error: 'Template introuvable' });
    }

    const { customName, title } = req.body;
    if (!customName || !title) return res.status(400).json({ error: 'customName et title requis' });

    const slug = slugify(customName, { lower: true, strict: true });

    // Copy all fields except _id, shortCode, publishedAt, published
    const merchantId = req.admin?.role === 'merchant' ? req.admin.merchantId : original.merchantId;
    const clone = await Publication.create({
      templateName: original.templateName,
      customName: slug,
      title: title,
      data: original.data || {},
      style: original.style || {},
      decorations: original.decorations || [],
      jarConfig: original.jarConfig || null,
      widgets: original.widgets || [],
      photoTransforms: original.photoTransforms || {},
      published: false,
      merchantId,
    });

    res.status(201).json(clone);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'Ce nom est déjà utilisé.' });
    res.status(400).json({ error: e.message });
  }
});

// POST unpublish
router.post('/:id/unpublish', requireOptionalAdmin, async (req, res) => {
  try {
    const existing = await Publication.findById(req.params.id).lean();
    if (!existing) return res.status(404).json({ error: 'Not found' });
    if (req.admin?.role === 'merchant' && existing.merchantId !== req.admin.merchantId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const pub = await Publication.findByIdAndUpdate(
      req.params.id,
      { published: false },
      { new: true }
    );
    if (!pub) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// DELETE
router.delete('/:id', requireOptionalAdmin, async (req, res) => {
  try {
    const existing = await Publication.findById(req.params.id).lean();
    if (!existing) return res.status(404).json({ error: 'Not found' });
    if (req.admin?.role === 'merchant' && existing.merchantId !== req.admin.merchantId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    await Publication.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// POST /api/publications/:id/client-details
// Handle client form submitted directly via publication link
const Order = require('../models/Order');

router.post('/:id/client-details', async (req, res) => {
  try {
    const { templateData, clientName } = req.body;
    if (!templateData) return res.status(400).json({ error: 'Données manquantes' });

    const pub = await Publication.findById(req.params.id);
    if (!pub) return res.status(404).json({ error: 'Publication introuvable' });

    // Find or create an Order for this publication
    let order = await Order.findOne({ publicationId: pub._id });
    if (!order) {
      order = new Order({
        ref: 'PUB-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        publicationId: pub._id,
        templateName: pub.templateName,
        status: 'en_cours',
        senderName: clientName || 'Client',
        merchantId: pub.merchantId,
      });
    }
    
    order.templateData = templateData;
    if (clientName) order.senderName = clientName;
    order.status = 'en_cours';
    
    await order.save();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;