/* ================================================================
   myKado — Wall claim (étape 8 flow murs)
   Flow "je reçois un mur" :
     1. Le créateur poste POST /api/walls/:pubId/invite-recipient
        avec {email}. Serveur génère un token, stocke, renvoie le lien.
     2. Le destinataire ouvre GET /api/walls/claim/:token → meta publique
        (nom du destinataire, event, total cagnotte) pour construire
        la page d'accueil.
     3. Après signup/login, POST /api/walls/claim/:token (authentifié)
        associe recipientUserId = req.admin.id et enregistre claimedAt.
   ---------------------------------------------------------------
   Sécurité :
     - Le token est un secret cryptographique 32 bytes → 64 chars hex.
     - Expire à 60 jours (rappel : la publication reste accessible
       en lecture publique, seul le claim est bordé dans le temps).
     - Un mur ne peut être claimed qu'une fois (recipientUserId set).
     - Le créateur peut renvoyer un nouveau token si le premier expire
       ou si le destinataire l'a perdu.
   ================================================================ */

const router = require('express').Router();
const crypto = require('crypto');
const Publication = require('../models/Publication');
const Contribution = require('../models/Contribution');
const { requireAdmin } = require('../middleware/auth');

const CLAIM_TTL_MS = 60 * 24 * 60 * 60 * 1000; // 60 jours

function generateClaimToken() {
  return crypto.randomBytes(32).toString('hex');
}

/* POST /api/walls/:pubId/invite-recipient
   Authentifié — seulement le créateur du mur peut inviter.
   Body : { email? }
   Retour : { claimUrl, token, expiresAt } */
router.post('/:pubId/invite-recipient', requireAdmin, async (req, res) => {
  try {
    const pub = await Publication.findById(req.params.pubId);
    if (!pub) return res.status(404).json({ error: 'Mur introuvable' });

    // Seul le créateur (merchantId) peut inviter. Les super_admin passent aussi.
    if (req.admin.role !== 'super_admin' && String(pub.merchantId) !== String(req.admin.merchantId)) {
      return res.status(403).json({ error: 'Seul le créateur de ce mur peut inviter le destinataire.' });
    }

    // Si déjà claimed, on refuse (le destinataire est verrouillé).
    if (pub.recipientUserId) {
      return res.status(409).json({
        error: 'Ce mur a déjà été réceptionné par le destinataire.',
        code: 'ALREADY_CLAIMED',
      });
    }

    const email = String(req.body?.email || '').trim().toLowerCase();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Email invalide.' });
    }

    const token = generateClaimToken();
    const expiresAt = new Date(Date.now() + CLAIM_TTL_MS);

    pub.recipientEmail       = email || pub.recipientEmail;
    pub.recipientClaimToken  = token;
    pub.recipientClaimExpiry = expiresAt;
    await pub.save();

    const appOrigin = process.env.APP_URL ||
      (process.env.NODE_ENV === 'production' ? 'https://app.mykado.store' : 'http://localhost:3000');
    const claimUrl = `${appOrigin}/ewish-admin/claim/${token}`;

    res.json({ success: true, claimUrl, token, expiresAt });
  } catch (err) {
    console.error('[wallClaim] invite failed', err);
    res.status(500).json({ error: err.message });
  }
});

/* GET /api/walls/claim/:token
   Public — permet d'afficher la landing avant login. Renvoie les meta
   nécessaires à composer un message d'accueil chaleureux. */
router.get('/claim/:token', async (req, res) => {
  try {
    const pub = await Publication.findOne({
      recipientClaimToken: req.params.token,
      recipientClaimExpiry: { $gt: new Date() },
    }).select('title data.titleName data.recipient data.occasionLabel data.occasion recipientUserId cagnotteConfig templateName _id').lean();

    if (!pub) {
      return res.status(404).json({
        error: 'Ce lien est invalide ou a expiré.',
        code: 'INVALID_OR_EXPIRED',
      });
    }

    /* Snapshot cagnotte pour éveiller l'appétit — total collecté à ce jour. */
    let cagnotteTotal = 0;
    if (pub.cagnotteConfig?.enabled) {
      const aggr = await Contribution.aggregate([
        { $match: { publicationId: pub._id, status: 'confirmed' } },
        { $group: { _id: null, sum: { $sum: '$amount' } } },
      ]);
      cagnotteTotal = aggr?.[0]?.sum || 0;
    }

    res.json({
      publicationId: String(pub._id),
      recipientName: pub.data?.recipient || pub.data?.titleName || '',
      title:         pub.title || '',
      occasionLabel: pub.data?.occasionLabel || '',
      occasion:      pub.data?.occasion || '',
      templateName:  pub.templateName,
      cagnotte: {
        enabled: !!pub.cagnotteConfig?.enabled,
        total:   cagnotteTotal,
        goal:    pub.cagnotteConfig?.goal || 0,
      },
      alreadyClaimed: !!pub.recipientUserId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* POST /api/walls/claim/:token
   Authentifié — le destinataire (login/signup fait) revendique le mur.
   Associe recipientUserId = req.admin.id + timestamp. Le token est
   consommé (mis à null) pour empêcher un double claim. */
router.post('/claim/:token', requireAdmin, async (req, res) => {
  try {
    const pub = await Publication.findOne({
      recipientClaimToken: req.params.token,
      recipientClaimExpiry: { $gt: new Date() },
    });
    if (!pub) {
      return res.status(404).json({
        error: 'Ce lien est invalide ou a expiré.',
        code: 'INVALID_OR_EXPIRED',
      });
    }
    if (pub.recipientUserId) {
      return res.status(409).json({
        error: 'Ce mur a déjà été réceptionné.',
        code: 'ALREADY_CLAIMED',
      });
    }

    /* Empêche le créateur de se réceptionner à lui-même — pas un cadeau. */
    if (String(pub.merchantId) === String(req.admin.merchantId)) {
      return res.status(400).json({
        error: 'Tu es le créateur de ce mur — le destinataire doit avoir un compte différent.',
        code: 'SELF_CLAIM',
      });
    }

    pub.recipientUserId      = String(req.admin.id);
    pub.recipientClaimedAt   = new Date();
    pub.recipientClaimToken  = undefined;
    pub.recipientClaimExpiry = undefined;
    await pub.save();

    /* Notif au créateur — fire-and-forget. */
    (async () => {
      try {
        const { notify } = require('../services/notifications');
        if (notify?.wallClaimed) {
          notify.wallClaimed(pub.merchantId, {
            publicationId: pub._id,
            recipientName: req.admin.name || '',
          });
        }
      } catch {}
    })().catch(() => {});

    res.json({
      success: true,
      publicationId: String(pub._id),
      redirectTo: `/ewish-admin/wall/${String(pub._id)}`,
    });
  } catch (err) {
    console.error('[wallClaim] claim failed', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
