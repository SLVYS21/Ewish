const router = require('express').Router();
const Wish = require('../models/Wish');
const Publication = require('../models/Publication');
const { requireAdmin } = require('../middleware/auth');
const { notify, ownerUserIdForPublication } = require('../services/notifications');

// POST /api/wishes/:publicationId  submit a wish (public)
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

    // Freemium: contributors always succeed. On unpaid walls, the first 5
    // text wishes go through as usual; any additional wish, or any wish with
    // media, is stored as pendingPayment=true and only appears on the wall
    // once the creator publishes (pays) the wall.
    const VALID_MEDIA = ['none', 'photo', 'gif', 'audio', 'video'];
    const hasMedia = !!(photoUrl || audioUrl || videoUrl || (mediaType && mediaType !== 'none'));

    let pendingPayment = false;
    if (isWallTemplate && !pub.isPaid) {
      if (hasMedia) {
        pendingPayment = true;
      } else {
        const freeCount = await Wish.countDocuments({
          publicationId: req.params.publicationId,
          pendingPayment: { $ne: true },
        });
        if (freeCount >= 5) pendingPayment = true;
      }
    }

    const autoApprove = isWallTemplate
      && !pub.cagnotteConfig?.requireModeration
      && !pendingPayment;

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
      pendingPayment,
    });

    // Notif au propriétaire du mur (fire-and-forget)
    (async () => {
      const ownerId = await ownerUserIdForPublication(pub);
      if (!ownerId) return;
      if (pub.cagnotteConfig?.requireModeration && !autoApprove) {
        notify.moderationPending(ownerId, { publicationId: pub._id, count: 1 });
      } else {
        notify.contributionReceived(ownerId, {
          publicationId: pub._id,
          contributorName: firstName.trim(),
          wallTitle: pub.title || pub.customName,
        });
      }
    })().catch(() => {});

    res.status(201).json({ success: true, id: wish._id, pendingPayment });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/wishes/:publicationId  list all wishes (admin)
router.get('/:publicationId', async (req, res) => {
  try {
    const wishes = await Wish.find({ publicationId: req.params.publicationId })
      .sort('-createdAt').lean();
    res.json(wishes);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/wishes/:publicationId/approved  approved + not hidden (template display)
router.get('/:publicationId/approved', async (req, res) => {
  try {
    const wishes = await Wish.find({
      publicationId: req.params.publicationId,
      approved: true,
      hidden: false,
      pendingPayment: { $ne: true },
    }).sort('createdAt').lean();
    res.json(wishes);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/wishes/:id  approve, hide, or update fields
router.patch('/:id', async (req, res) => {
  try {
    const existing = await Wish.findById(req.params.id).lean();
    if (!existing) return res.status(404).json({ error: 'Not found' });

    // Block approval of a pendingPayment wish until the wall is paid
    if (existing.pendingPayment && req.body.approved === true) {
      const pub = await Publication.findById(existing.publicationId).lean();
      if (!pub?.isPaid) {
        return res.status(402).json({
          error: 'Ce mot est verrouillé. Publie le mur pour le débloquer.',
          code: 'WISH_LOCKED_PAYMENT',
        });
      }
    }

    const allowed = ['approved', 'hidden', 'role', 'message'];
    const update  = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });

    const wish = await Wish.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    res.json(wish);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/wishes/:publicationId/release-pending
// Called after the wall is paid: flip pendingPayment off on every wish, and
// auto-approve them when moderation is off.
router.post('/:publicationId/release-pending', async (req, res) => {
  try {
    const pub = await Publication.findById(req.params.publicationId).lean();
    if (!pub) return res.status(404).json({ error: 'Publication not found' });
    if (!pub.isPaid) {
      return res.status(402).json({ error: 'Le mur n\'est pas encore payé.' });
    }
    const autoApprove = !pub.cagnotteConfig?.requireModeration;
    const update = autoApprove
      ? { $set: { pendingPayment: false, approved: true } }
      : { $set: { pendingPayment: false } };
    const result = await Wish.updateMany(
      { publicationId: req.params.publicationId, pendingPayment: true },
      update
    );
    res.json({ released: result.modifiedCount, autoApproved: autoApprove });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/wishes/:id  admin only
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await Wish.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/wishes/:publicationId/approve-all  bulk approve (admin convenience)
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
