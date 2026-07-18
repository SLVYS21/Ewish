const router      = require('express').Router();
const { nanoid }  = require('nanoid');
const Publication = require('../models/Publication');
const Rsvp        = require('../models/Rsvp');
const Guest       = require('../models/Guest');
const Wish        = require('../models/Wish');
const { requireAdmin, requireOptionalAdmin } = require('../middleware/auth');

/* ── Helpers ─────────────────────────────────────────────── */
const VALID_STATUS = ['accepted', 'declined', 'maybe'];

function clientIp(req) {
  return (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().split(',')[0].trim();
}

function csvEscape(v) {
  if (v == null) return '';
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

async function canAccessPublication(req, pub) {
  if (!req.admin) return false;
  if (req.admin.role === 'super_admin') return true;
  return pub.merchantId && pub.merchantId === req.admin.merchantId;
}

async function emitNotification(pub, rsvp) {
  // Stub: nodemailer non installé. Si plus tard une infra mail est ajoutée,
  // brancher l'envoi ici. Pour l'instant on log.
  if (!pub.invitationConfig?.notifyOnEachRsvp || !pub.invitationConfig?.notifyEmail) return;
  console.log(`[invitation] RSVP ${rsvp.status} de ${rsvp.guestName} pour ${pub.title} → ${pub.invitationConfig.notifyEmail}`);
}

/* ─────────────────────────────────────────────────────────
   PUBLIC : récupérer le contexte d'invitation (page RSVP)
   ───────────────────────────────────────────────────────── */
router.get('/:pubId/context', async (req, res) => {
  try {
    const pub = await Publication.findById(req.params.pubId).lean();
    if (!pub) return res.status(404).json({ error: 'Publication introuvable' });
    if (!pub.invitationConfig?.enabled) return res.status(404).json({ error: 'Invitation non activée' });

    let guest = null;
    if (req.query.token) {
      guest = await Guest.findOne({ publicationId: pub._id, token: req.query.token }).lean();
      if (!guest) return res.status(404).json({ error: 'Lien invité invalide' });
    } else if (pub.invitationConfig.mode === 'list') {
      return res.status(403).json({ error: 'Cette invitation est privée — un lien personnel est requis' });
    }

    const existing = guest?.rsvpId ? await Rsvp.findById(guest.rsvpId).lean() : null;

    res.json({
      title: pub.title,
      data: pub.data,
      style: pub.style,
      invitation: pub.invitationConfig,
      guest: guest ? { name: guest.name, email: guest.email } : null,
      existing: existing
        ? { status: existing.status, plusOnes: existing.plusOnes, message: existing.message }
        : null,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ─────────────────────────────────────────────────────────
   PUBLIC : soumettre / mettre à jour un RSVP
   ───────────────────────────────────────────────────────── */
router.post('/:pubId/rsvp', async (req, res) => {
  try {
    const pub = await Publication.findById(req.params.pubId);
    if (!pub) return res.status(404).json({ error: 'Publication introuvable' });
    const cfg = pub.invitationConfig;
    if (!cfg?.enabled) return res.status(403).json({ error: 'Invitation désactivée' });

    if (cfg.rsvpDeadline && new Date() > new Date(cfg.rsvpDeadline)) {
      return res.status(403).json({ error: 'La date limite de réponse est passée.' });
    }

    const { guestName, guestEmail, guestPhone, status, plusOnes, message, token } = req.body;

    if (!VALID_STATUS.includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }
    if (status === 'maybe' && !cfg.allowMaybe) {
      return res.status(400).json({ error: '"Peut-être" n\'est pas autorisé' });
    }

    let guest = null;
    if (cfg.mode === 'list') {
      if (!token) return res.status(403).json({ error: 'Lien personnel requis' });
      guest = await Guest.findOne({ publicationId: pub._id, token });
      if (!guest) return res.status(404).json({ error: 'Lien invité invalide' });
    } else {
      if (!guestName?.trim()) return res.status(400).json({ error: 'Le nom est requis' });
    }

    const finalName  = (guest?.name || guestName || '').trim();
    const finalEmail = (guest?.email || guestEmail || '').trim().toLowerCase();

    const maxPlus = cfg.allowPlusOnes ? (cfg.maxPlusOnes || 0) : 0;
    const plus = Math.max(0, Math.min(maxPlus, Number(plusOnes) || 0));

    // Anti-doublon mode public : (publicationId + email) OU update via cookie
    let rsvp;
    if (guest) {
      rsvp = guest.rsvpId ? await Rsvp.findById(guest.rsvpId) : null;
    } else if (finalEmail) {
      rsvp = await Rsvp.findOne({ publicationId: pub._id, guestEmail: finalEmail });
    } else if (req.cookies?.[`ww_rsvp_${pub._id}`]) {
      rsvp = await Rsvp.findById(req.cookies[`ww_rsvp_${pub._id}`]);
    }

    const payload = {
      publicationId: pub._id,
      guestName: finalName,
      guestEmail: finalEmail,
      guestPhone: (guestPhone || guest?.phone || '').trim(),
      status,
      plusOnes: plus,
      message: (message || '').trim(),
      guestId: guest?._id || null,
      token: guest?.token || undefined,
      ip: clientIp(req),
      userAgent: (req.headers['user-agent'] || '').slice(0, 200),
      respondedAt: new Date(),
    };

    if (rsvp) {
      Object.assign(rsvp, payload);
      await rsvp.save();
    } else {
      rsvp = await Rsvp.create(payload);
      res.cookie(`ww_rsvp_${pub._id}`, String(rsvp._id), {
        httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 24 * 180,
      });
    }

    if (guest) {
      guest.rsvpId = rsvp._id;
      await guest.save();
    }

    // Si accepté + message + option activée → post-it sur le mur lié
    if (status === 'accepted' && cfg.messageOnAccept && payload.message) {
      try {
        if (rsvp.wishId) {
          await Wish.findByIdAndUpdate(rsvp.wishId, {
            firstName: finalName,
            message: payload.message,
            approved: !pub.cagnotteConfig?.requireModeration,
          });
        } else {
          const wish = await Wish.create({
            publicationId: pub._id,
            firstName: finalName,
            role: '',
            message: payload.message,
            color: Math.floor(Math.random() * 4),
            rot: (Math.random() * 6 - 3),
            mediaType: 'none',
            approved: !pub.cagnotteConfig?.requireModeration,
          });
          rsvp.wishId = wish._id;
          await rsvp.save();
        }
      } catch (e) { console.warn('Wish auto-create failed:', e.message); }
    } else if (status !== 'accepted' && rsvp.wishId) {
      // L'invité a changé d'avis → on cache le post-it (sans hard delete)
      try { await Wish.findByIdAndUpdate(rsvp.wishId, { hidden: true }); } catch {}
    }

    emitNotification(pub, rsvp).catch(() => {});

    res.status(201).json({
      success: true,
      status: rsvp.status,
      message: cfg.confirmationMessage || null,
    });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'Vous avez déjà répondu avec cet email.' });
    res.status(500).json({ error: e.message });
  }
});

/* ─────────────────────────────────────────────────────────
   ADMIN : liste, stats, export, gestion invités
   ───────────────────────────────────────────────────────── */

async function loadPubForAdmin(req, res) {
  const pub = await Publication.findById(req.params.pubId).lean();
  if (!pub) { res.status(404).json({ error: 'Publication introuvable' }); return null; }
  if (!(await canAccessPublication(req, pub))) {
    res.status(403).json({ error: 'Accès refusé' });
    return null;
  }
  return pub;
}

router.get('/:pubId/rsvps', requireAdmin, async (req, res) => {
  try {
    const pub = await loadPubForAdmin(req, res);
    if (!pub) return;

    const { status, search } = req.query;
    const q = { publicationId: pub._id };
    if (status && ['accepted', 'declined', 'maybe', 'pending'].includes(status)) q.status = status;
    if (search) {
      const re = { $regex: search, $options: 'i' };
      q.$or = [{ guestName: re }, { guestEmail: re }, { message: re }];
    }
    const rsvps = await Rsvp.find(q).sort('-respondedAt').lean();
    res.json(rsvps);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:pubId/stats', requireAdmin, async (req, res) => {
  try {
    const pub = await loadPubForAdmin(req, res);
    if (!pub) return;

    const [agg, guestCount] = await Promise.all([
      Rsvp.aggregate([
        { $match: { publicationId: pub._id } },
        { $group: { _id: '$status', count: { $sum: 1 }, plusOnes: { $sum: '$plusOnes' } } },
      ]),
      Guest.countDocuments({ publicationId: pub._id }),
    ]);

    const stats = { accepted: 0, declined: 0, maybe: 0, pending: 0, plusOnes: 0, totalGuests: guestCount };
    agg.forEach(r => {
      if (r._id in stats) stats[r._id] = r.count;
      stats.plusOnes += r.plusOnes || 0;
    });
    stats.totalResponses = stats.accepted + stats.declined + stats.maybe;
    stats.totalAttending = stats.accepted + stats.plusOnes;

    // Série temporelle (par jour, 30 derniers jours)
    const since = new Date(Date.now() - 30 * 86400000);
    const timeline = await Rsvp.aggregate([
      { $match: { publicationId: pub._id, respondedAt: { $gte: since } } },
      { $group: {
        _id: { d: { $dateToString: { format: '%Y-%m-%d', date: '$respondedAt' } }, s: '$status' },
        count: { $sum: 1 },
      } },
      { $sort: { '_id.d': 1 } },
    ]);

    res.json({ stats, timeline });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:pubId/export.csv', requireAdmin, async (req, res) => {
  try {
    const pub = await loadPubForAdmin(req, res);
    if (!pub) return;

    const rsvps = await Rsvp.find({ publicationId: pub._id }).sort('-respondedAt').lean();
    const header = ['Nom', 'Email', 'Téléphone', 'Statut', 'Accompagnants', 'Message', 'Répondu le'];
    const rows = rsvps.map(r => [
      r.guestName, r.guestEmail, r.guestPhone, r.status, r.plusOnes, r.message,
      r.respondedAt ? new Date(r.respondedAt).toISOString() : '',
    ]);
    const csv = [header, ...rows].map(row => row.map(csvEscape).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="rsvp-${pub.customName}.csv"`);
    res.send('﻿' + csv);  // BOM pour Excel
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ─── Guest list (mode 'list') ─── */
router.get('/:pubId/guests', requireAdmin, async (req, res) => {
  try {
    const pub = await loadPubForAdmin(req, res);
    if (!pub) return;
    const guests = await Guest.find({ publicationId: pub._id }).sort('name').lean();
    res.json(guests);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:pubId/guests', requireAdmin, async (req, res) => {
  try {
    const pub = await loadPubForAdmin(req, res);
    if (!pub) return;
    const { name, email, phone, group, notes } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Nom requis' });
    const guest = await Guest.create({
      publicationId: pub._id,
      name: name.trim(),
      email: (email || '').trim().toLowerCase(),
      phone: (phone || '').trim(),
      group: group || '',
      notes: notes || '',
      token: nanoid(12),
    });
    res.status(201).json(guest);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'Conflit token, réessayez.' });
    res.status(400).json({ error: e.message });
  }
});

router.patch('/:pubId/guests/:guestId', requireAdmin, async (req, res) => {
  try {
    const pub = await loadPubForAdmin(req, res);
    if (!pub) return;
    const allowed = ['name', 'email', 'phone', 'group', 'notes', 'sentAt', 'sentVia'];
    const update = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
    const guest = await Guest.findOneAndUpdate(
      { _id: req.params.guestId, publicationId: pub._id },
      { $set: update }, { new: true }
    );
    if (!guest) return res.status(404).json({ error: 'Invité introuvable' });
    res.json(guest);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.delete('/:pubId/guests/:guestId', requireAdmin, async (req, res) => {
  try {
    const pub = await loadPubForAdmin(req, res);
    if (!pub) return;
    const guest = await Guest.findOneAndDelete({ _id: req.params.guestId, publicationId: pub._id });
    if (!guest) return res.status(404).json({ error: 'Invité introuvable' });
    res.json({ success: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.post('/:pubId/guests/import', requireAdmin, async (req, res) => {
  try {
    const pub = await loadPubForAdmin(req, res);
    if (!pub) return;
    const list = Array.isArray(req.body?.guests) ? req.body.guests : [];
    const docs = list
      .filter(g => g && g.name && g.name.trim())
      .map(g => ({
        publicationId: pub._id,
        name: g.name.trim(),
        email: (g.email || '').trim().toLowerCase(),
        phone: (g.phone || '').trim(),
        group: g.group || '',
        notes: g.notes || '',
        token: nanoid(12),
      }));
    if (!docs.length) return res.status(400).json({ error: 'Aucun invité valide' });
    const created = await Guest.insertMany(docs, { ordered: false });
    res.status(201).json({ created: created.length });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

module.exports = router;
