const router = require('express').Router();
const Publication = require('../models/Publication');
const Contribution = require('../models/Contribution');
const { kkiapay } = require('@kkiapay-org/nodejs-sdk');

const k = kkiapay({
  privatekey: process.env.KKIAPAY_PRIVATE_KEY || '',
  publickey:  process.env.KKIAPAY_PUBLIC_KEY || '',
  secretkey:  process.env.KKIAPAY_SECRET_KEY || '',
  sandbox:    process.env.KKIAPAY_SANDBOX === 'true',
});

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

// POST /api/contributions/verify  public: verify KKiaPay + save contribution
router.post('/verify', async (req, res) => {
  try {
    const { transactionId, publicationId, contributorName, isAnonymous, wishId } = req.body;
    if (!transactionId || !publicationId) return res.status(400).json({ error: 'Données manquantes' });

    const existing = await Contribution.findOne({ transactionId });
    if (existing) return res.json({ success: true, contribution: existing });

    const response = await k.verify(transactionId);
    if (response.status !== 'SUCCESS') return res.status(400).json({ error: 'Transaction non confirmée' });

    const contribution = await Contribution.create({
      publicationId,
      transactionId,
      amount: response.amount,
      contributorName: isAnonymous ? '' : (contributorName || ''),
      isAnonymous: !!isAnonymous,
      wishId: wishId || null,
      status: 'confirmed',
    });

    // Notif propriétaire du mur (fire-and-forget)
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
