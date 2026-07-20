const router = require('express').Router();
const Wish = require('../models/Wish');
const Publication = require('../models/Publication');
const { requireAdmin } = require('../middleware/auth');
const { notify, ownerUserIdForPublication } = require('../services/notifications');
const wallEvents = require('../services/wallEvents');

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
    if (isWallTemplate) {
      const planType = pub.planType || 'free';
      let limit = 10;
      if (planType === 'premium') limit = 100;
      if (planType === 'infinite') limit = Infinity;

      // Un mot est en attente de paiement si :
      // - Il contient un média et le plan est 'free'
      // - Ou si le nombre de mots dépasse la limite du plan
      if (planType === 'free' && hasMedia) {
        pendingPayment = true;
      } else {
        const visibleCount = await Wish.countDocuments({
          publicationId: req.params.publicationId,
          pendingPayment: { $ne: true },
        });
        if (visibleCount >= limit) {
          pendingPayment = true;
        }
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

    // Live push aux murs branchés en SSE — uniquement si visible tout de suite.
    if (autoApprove && !pendingPayment) {
      wallEvents.emitWish(pub._id, wish);
    }

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

    // Block approval of a pendingPayment wish until the wall is upgraded
    if (existing.pendingPayment && req.body.approved === true) {
      const pub = await Publication.findById(existing.publicationId).lean();
      const planType = pub?.planType || 'free';
      if (planType === 'free') {
        return res.status(402).json({
          error: 'Ce mot est verrouillé. Upgradez vers Premium ou Illimité pour le débloquer.',
          code: 'WISH_LOCKED_PAYMENT',
        });
      }
    }

    const allowed = ['approved', 'hidden', 'role', 'message'];
    const update  = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });

    const wish = await Wish.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });

    // Si un modérateur vient d'approuver + démasquer, push live sur le mur.
    const becameVisible =
      wish &&
      wish.approved === true &&
      wish.hidden === false &&
      !wish.pendingPayment &&
      (existing.approved !== true || existing.hidden === true);
    if (becameVisible) {
      wallEvents.emitWish(wish.publicationId, wish);
    }

    res.json(wish);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Called after the wall is upgraded: flip pendingPayment off on every wish
// up to the new limit, and auto-approve them when moderation is off.
router.post('/:publicationId/release-pending', async (req, res) => {
  try {
    const pub = await Publication.findById(req.params.publicationId).lean();
    if (!pub) return res.status(404).json({ error: 'Publication not found' });
    
    const planType = pub.planType || 'free';
    if (planType === 'free') {
      return res.status(402).json({ error: 'Le mur nécessite un plan payant.' });
    }

    // Calcul de la limite
    let limit = 100; // premium
    if (planType === 'infinite') limit = Infinity;

    // Combien de mots visibles actuels ?
    const visibleCount = await Wish.countDocuments({
      publicationId: req.params.publicationId,
      pendingPayment: { $ne: true },
    });

    const autoApprove = !pub.cagnotteConfig?.requireModeration;
    const update = autoApprove
      ? { $set: { pendingPayment: false, approved: true } }
      : { $set: { pendingPayment: false } };

    // Si on est premium, on débloque jusqu'à 100
    let releasedCount = 0;
    if (limit === Infinity) {
      const result = await Wish.updateMany(
        { publicationId: req.params.publicationId, pendingPayment: true },
        update
      );
      releasedCount = result.modifiedCount;
    } else {
      // Premium : on libère (limit - visibleCount) mots
      const slotsLeft = limit - visibleCount;
      if (slotsLeft > 0) {
        const toRelease = await Wish.find({ publicationId: req.params.publicationId, pendingPayment: true })
          .sort('createdAt')
          .limit(slotsLeft)
          .select('_id');
        const ids = toRelease.map(w => w._id);
        const result = await Wish.updateMany(
          { _id: { $in: ids } },
          update
        );
        releasedCount = result.modifiedCount;
      }
    }

    // Après release, on push tous les vœux nouvellement visibles pour que
    // les murs projetés se mettent à jour sans reload.
    if (autoApprove && releasedCount > 0) {
      const released = await Wish.find({
        publicationId: req.params.publicationId,
        pendingPayment: false,
        approved: true,
        hidden: false,
      }).sort('-updatedAt').limit(releasedCount).lean();
      released.forEach(w => wallEvents.emitWish(req.params.publicationId, w));
    }

    res.json({ released: releasedCount, autoApproved: autoApprove });
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
