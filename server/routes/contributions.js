const router = require('express').Router();
const Publication = require('../models/Publication');
const Contribution = require('../models/Contribution');
const wallEvents = require('../services/wallEvents');
const feexpay = require('../services/feexpay');

// GET /api/contributions/:pubId  public: list confirmed contributions
router.get('/:pubId', async (req, res) => {
  try {
    const contributions = await Contribution.find({
      publicationId: req.params.pubId,
      status: 'confirmed',
    }).sort('-createdAt').lean();
    res.json(contributions);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/contributions/:pubId/stats
router.get('/:pubId/stats', async (req, res) => {
  try {
    const [contribs, pub] = await Promise.all([
      Contribution.find({ publicationId: req.params.pubId, status: 'confirmed' }).lean(),
      Publication.findById(req.params.pubId).lean(),
    ]);
    const total = contribs.reduce((s, c) => s + c.amount, 0);
    const count = contribs.length;
    const goal  = pub?.cagnotteConfig?.goal || 0;
    res.json({ total, count, goal, pct: goal > 0 ? Math.round((total / goal) * 100) : 0 });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ---------------------------------------------------------------- *
   POST /api/contributions/feexpay-init  (public)
   Body: {
     publicationId, amount, operator, phone?,
     contributorName?, isAnonymous?, wishId?, email?
   }
   - operator = 'card' → initCard (renvoie redirectUrl)
   - sinon              → initMobileMoney (phone requis)
   Renvoie { reference, redirectUrl? } — le front poll ensuite
   /status/:reference et POST /verify au succès.
 * ---------------------------------------------------------------- */
router.post('/feexpay-init', async (req, res) => {
  try {
    const {
      publicationId, amount, operator, phone,
      contributorName, isAnonymous, wishId, email,
    } = req.body || {};

    if (!publicationId) return res.status(400).json({ error: 'publicationId requis' });
    const amt = Number(amount);
    if (!amt || amt <= 0)  return res.status(400).json({ error: 'Montant invalide' });
    if (!operator)         return res.status(400).json({ error: 'Opérateur requis' });

    const pub = await Publication.findById(publicationId).select('cagnotteConfig data title').lean();
    if (!pub) return res.status(404).json({ error: 'Mur introuvable' });
    if (!pub.cagnotteConfig?.enabled) {
      return res.status(400).json({ error: 'La cagnotte n\'est pas activée sur ce mur.' });
    }

    const displayName = isAnonymous ? 'Anonyme' : (contributorName || '');
    const description = `Contribution ${pub.data?.name || pub.title || 'myKado'}`;
    /* customId : permet à FeexPay de nous renvoyer notre propre identifiant
       (utile pour un webhook futur ou du debug côté dashboard FeexPay). */
    const customId = `pub:${publicationId}${wishId ? `|wish:${wishId}` : ''}`;

    if (String(operator).toLowerCase() === 'card') {
      const out = await feexpay.initCard({
        amount: amt,
        description,
        customId,
        email,
        firstName: displayName,
      });
      return res.json({ reference: out.reference, redirectUrl: out.redirectUrl });
    }

    if (!phone) return res.status(400).json({ error: 'Numéro requis pour Mobile Money' });

    const out = await feexpay.initMobileMoney({
      amount: amt,
      phone,
      operator,
      description,
      customId,
      email,
      firstName: displayName,
    });
    res.json({ reference: out.reference });
  } catch (e) {
    console.error('[contributions/feexpay-init]', e.message);
    res.status(500).json({ error: e.response?.data?.message || e.message });
  }
});

/* ---------------------------------------------------------------- *
   GET /api/contributions/status/:reference  (public)
   Utilisé par le front pour poller pendant que le contributeur
   confirme le paiement sur son téléphone.
 * ---------------------------------------------------------------- */
router.get('/status/:reference', async (req, res) => {
  try {
    const out = await feexpay.verify(req.params.reference);
    res.json({ status: out.status, amount: out.amount, reference: out.reference });
  } catch (e) {
    res.status(500).json({ error: e.message, status: 'PENDING' });
  }
});

/* ---------------------------------------------------------------- *
   POST /api/contributions/verify  (public)
   Body : { reference, publicationId, contributorName?, isAnonymous?, wishId? }
   Compat : accepte encore transactionId à la place de reference.
 * ---------------------------------------------------------------- */
router.post('/verify', async (req, res) => {
  try {
    const {
      publicationId, contributorName, isAnonymous, wishId,
    } = req.body || {};
    const reference = req.body?.reference || req.body?.transactionId;

    if (!reference || !publicationId) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    const existing = await Contribution.findOne({ transactionId: reference });
    if (existing && existing.status === 'confirmed') {
      return res.json({ success: true, contribution: existing });
    }

    const response = await feexpay.verify(reference);
    if (response.status !== 'SUCCESSFUL') {
      return res.status(400).json({ error: 'Transaction non confirmée', status: response.status });
    }

    const contribution = existing || await Contribution.create({
      publicationId,
      transactionId: reference,
      amount:        response.amount,
      contributorName: isAnonymous ? '' : (contributorName || ''),
      isAnonymous:   !!isAnonymous,
      wishId:        wishId || null,
      status:        'confirmed',
    });
    if (existing) {
      existing.status = 'confirmed';
      existing.amount = response.amount;
      await existing.save();
    }

    // Live push (SSE) : contribution + stats agrégées à jour.
    try {
      const [aggr, pub] = await Promise.all([
        Contribution.aggregate([
          { $match: { publicationId: contribution.publicationId, status: 'confirmed' } },
          { $group: { _id: null, sum: { $sum: '$amount' }, count: { $sum: 1 } } },
        ]),
        Publication.findById(publicationId).select('cagnotteConfig.goal').lean(),
      ]);
      const total = aggr?.[0]?.sum || 0;
      const count = aggr?.[0]?.count || 0;
      const goal  = pub?.cagnotteConfig?.goal || 0;
      const stats = { total, count, goal, pct: goal > 0 ? Math.round((total / goal) * 100) : 0 };
      wallEvents.emitContribution(publicationId, contribution, stats);
    } catch (err) {
      console.warn('[contributions] SSE emit failed', err.message);
    }

    // Notif propriétaire (fire-and-forget)
    (async () => {
      const { notify, ownerUserIdForPublication } = require('../services/notifications');
      const ownerId = await ownerUserIdForPublication(publicationId);
      if (!ownerId) return;
      const Contribution2 = require('../models/Contribution');
      const total = await Contribution2.aggregate([
        { $match: { publicationId: contribution.publicationId, status: 'confirmed' } },
        { $group: { _id: null, sum: { $sum: '$amount' } } },
      ]);
      notify.cagnotteContribution(ownerId, {
        publicationId,
        amount: response.amount,
        currency: 'XOF',
        total: total?.[0]?.sum,
      });
    })().catch(() => {});

    res.json({ success: true, contribution });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
