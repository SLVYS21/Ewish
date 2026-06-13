const router = require('express').Router();
const Wish = require('../models/Wish');
const Publication = require('../models/Publication');
const { requireAdmin } = require('../middleware/auth');

// POST /api/wishes/:publicationId — submit a wish (public)
router.post('/:publicationId', async (req, res) => {
  try {
    const pub = await Publication.findById(req.params.publicationId).lean();
    if (!pub) return res.status(404).json({ error: 'Publication not found' });

    // all wall-of-wishes variants: allow submissions even when unpublished (freemium model)
    const isWallTemplate = pub.templateName.startsWith('wall-of-wishes');
    if (!pub.published && !isWallTemplate) {
      return res.status(403).json({ error: 'Ce mur n\'est pas encore ouvert.' });
    }
    if (pub.cagnotteConfig?.wishesEnabled === false) {
      return res.status(403).json({ error: 'Les vœux sont désactivés pour cette publication.' });
    }

    const { firstName, role, message, photoUrl, audioUrl, videoUrl, color, rot, mediaType } = req.body;
    if (!firstName?.trim() || !message?.trim()) {
      return res.status(400).json({ error: 'firstName and message are required' });
    }

    // Freemium gate: unpublished wall templates → max 5 text wishes, no media
    if (isWallTemplate && !pub.isPaid) {
      const hasMedia = photoUrl || audioUrl || videoUrl || (mediaType && mediaType !== 'none');
      if (hasMedia) {
        return res.status(402).json({
          error: 'Le partage de médias nécessite un mur publié.',
          code: 'MEDIA_REQUIRES_PAID',
        });
      }
      const wishCount = await Wish.countDocuments({ publicationId: req.params.publicationId });
      if (wishCount >= 5) {
        return res.status(402).json({
          error: 'Les 5 premiers vœux gratuits ont été utilisés. Le créateur doit publier le mur pour continuer.',
          code: 'FREE_LIMIT_REACHED',
        });
      }
    }

    const VALID_MEDIA = ['none', 'photo', 'gif', 'audio', 'video'];
    const autoApprove = isWallTemplate && !pub.cagnotteConfig?.requireModeration;

    const wish = await Wish.create({
      publicationId: req.params.publicationId,
      firstName:     firstName.trim(),
      role:          role?.trim() || '',
      message:       message.trim(),
      photoUrl:      photoUrl  || '',
      audioUrl:      audioUrl  || '',
      videoUrl:      videoUrl  || '',
      color:         Number.isInteger(color) ? Math.max(0, Math.min(6, color)) : 0,
      rot:           typeof rot === 'number'  ? rot : 0,
      mediaType:     VALID_MEDIA.includes(mediaType) ? mediaType : 'none',
      approved:      autoApprove,
    });

    res.status(201).json({ success: true, id: wish._id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/wishes/:publicationId — list all wishes (admin)
router.get('/:publicationId', async (req, res) => {
  try {
    const wishes = await Wish.find({ publicationId: req.params.publicationId })
      .sort('-createdAt').lean();
    res.json(wishes);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/wishes/:publicationId/approved — approved + not hidden (template display)
router.get('/:publicationId/approved', async (req, res) => {
  try {
    const wishes = await Wish.find({
      publicationId: req.params.publicationId,
      approved: true,
      hidden: false,
    }).sort('createdAt').lean();
    res.json(wishes);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/wishes/:id — approve, hide, or update fields
router.patch('/:id', async (req, res) => {
  try {
    const existing = await Wish.findById(req.params.id).lean();
    if (!existing) return res.status(404).json({ error: 'Not found' });

    const allowed = ['approved', 'hidden', 'role', 'message'];
    const update  = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });

    const wish = await Wish.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    res.json(wish);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/wishes/:id — admin only
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await Wish.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/wishes/:publicationId/approve-all — bulk approve (admin convenience)
router.post('/:publicationId/approve-all', async (req, res) => {
  try {
    const result = await Wish.updateMany(
      { publicationId: req.params.publicationId, approved: false },
      { $set: { approved: true } }
    );
    res.json({ updated: result.modifiedCount });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
