/* ================================================================
   myKado — Wall withdrawal (étape 8 flow murs, slice 3)
   Le destinataire (recipientUserId) demande le retrait de sa cagnotte.
   Gates cumulatifs :
     1. Publication existe
     2. req.admin.id === recipientUserId  (seul le destinataire peut retirer)
     3. cagnotteConfig.enabled === true
     4. AdminUser.kycStatus === 'approved'
     5. Total confirmé > 0 (sinon rien à retirer)
     6. withdrawal.status !== 'paid' (déjà payé)
   ---------------------------------------------------------------
   Un endpoint status GET permet à l'UI de savoir dans quel état on est
   sans avoir à re-fetch toute la publication.
   ================================================================ */

const router = require('express').Router();
const Publication = require('../models/Publication');
const Contribution = require('../models/Contribution');
const AdminUser = require('../models/AdminUser');
const { requireAdmin } = require('../middleware/auth');

/* Utilitaire : masque un compte Mobile Money / IBAN pour l'affichage.
   "+229 90 XX XX 07" au lieu de le renvoyer en clair. */
function maskAccount(s) {
  const raw = String(s || '');
  if (raw.length <= 4) return raw;
  const visibleTail = raw.slice(-4);
  return raw.slice(0, 3) + ' •••• ' + visibleTail;
}

async function cagnotteTotalFor(pubId) {
  const aggr = await Contribution.aggregate([
    { $match: { publicationId: pubId, status: 'confirmed' } },
    { $group: { _id: null, sum: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);
  return {
    total: aggr?.[0]?.sum || 0,
    count: aggr?.[0]?.count || 0,
  };
}

/* GET /api/walls/:pubId/withdraw/status
   Renvoie l'état complet du retrait pour l'UI destinataire. */
router.get('/:pubId/withdraw/status', requireAdmin, async (req, res) => {
  try {
    const pub = await Publication.findById(req.params.pubId)
      .select('recipientUserId merchantId cagnotteConfig cagnotteWithdrawal')
      .lean();
    if (!pub) return res.status(404).json({ error: 'Mur introuvable' });

    const isRecipient = String(pub.recipientUserId || '') === String(req.admin.id);
    const isCreator   = String(pub.merchantId || '') === String(req.admin.merchantId || '');

    // Seul recipient ou créateur peuvent voir le status
    if (!isRecipient && !isCreator && req.admin.role !== 'super_admin') {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const { total, count } = await cagnotteTotalFor(pub._id);

    // Récupère le KYC de l'utilisateur courant si c'est le destinataire
    let kycStatus = 'none';
    if (isRecipient) {
      const u = await AdminUser.findById(req.admin.id).select('kycStatus').lean();
      kycStatus = u?.kycStatus || 'none';
    }

    const w = pub.cagnotteWithdrawal || {};

    res.json({
      cagnotte: {
        enabled: !!pub.cagnotteConfig?.enabled,
        total,
        count,
        goal: pub.cagnotteConfig?.goal || 0,
      },
      role: isRecipient ? 'recipient' : (isCreator ? 'creator' : 'other'),
      recipientClaimed: !!pub.recipientUserId,
      kycStatus,
      withdrawal: {
        status:     w.status || 'none',
        method:     w.method || '',
        account:    w.account ? maskAccount(w.account) : '',
        requestedAt:w.requestedAt || null,
        paidAt:     w.paidAt || null,
        paidAmount: w.paidAmount || 0,
        reference:  w.reference || '',
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* POST /api/walls/:pubId/withdraw/request
   Body : { method, account }
     method : 'mobile-money-mtn' | 'mobile-money-orange' | 'mobile-money-moov' | 'bank'
     account: numéro / IBAN
   Vérifie tous les gates listés en tête de fichier. */
router.post('/:pubId/withdraw/request', requireAdmin, async (req, res) => {
  try {
    const pub = await Publication.findById(req.params.pubId);
    if (!pub) return res.status(404).json({ error: 'Mur introuvable' });

    /* Gate 1 : identité du demandeur */
    if (String(pub.recipientUserId || '') !== String(req.admin.id)) {
      return res.status(403).json({
        error: 'Seul le destinataire du mur peut retirer la cagnotte.',
        code: 'NOT_RECIPIENT',
      });
    }

    /* Gate 2 : cagnotte active */
    if (!pub.cagnotteConfig?.enabled) {
      return res.status(400).json({
        error: 'Ce mur n\'a pas de cagnotte activée.',
        code: 'CAGNOTTE_DISABLED',
      });
    }

    /* Gate 3 : KYC approuvé */
    const user = await AdminUser.findById(req.admin.id).select('kycStatus');
    if (user?.kycStatus !== 'approved') {
      return res.status(403).json({
        error: 'Ton identité doit être vérifiée avant tout retrait.',
        code: 'KYC_REQUIRED',
        kycStatus: user?.kycStatus || 'none',
      });
    }

    /* Gate 4 : total > 0 */
    const { total } = await cagnotteTotalFor(pub._id);
    if (total <= 0) {
      return res.status(400).json({
        error: 'Aucune contribution confirmée à retirer.',
        code: 'EMPTY_CAGNOTTE',
      });
    }

    /* Gate 5 : pas déjà payé */
    if (pub.cagnotteWithdrawal?.status === 'paid') {
      return res.status(409).json({
        error: 'Cette cagnotte a déjà été payée.',
        code: 'ALREADY_PAID',
      });
    }

    /* Validation body */
    const method = String(req.body?.method || '').trim();
    const account = String(req.body?.account || '').trim();
    const ALLOWED_METHODS = ['mobile-money-mtn', 'mobile-money-orange', 'mobile-money-moov', 'bank'];
    if (!ALLOWED_METHODS.includes(method)) {
      return res.status(400).json({ error: 'Méthode de retrait invalide.', code: 'BAD_METHOD' });
    }
    if (!account || account.length < 6) {
      return res.status(400).json({ error: 'Compte de retrait requis.', code: 'BAD_ACCOUNT' });
    }

    pub.cagnotteWithdrawal = {
      status: 'pending',
      method,
      account,
      requestedAt: new Date(),
      paidAt: null,
      paidAmount: 0,
      reference: '',
    };
    await pub.save();

    /* Notifie les admins (super_admin) qu'un retrait attend paiement.
       Comme il n'y a pas encore de channel notif dédié, on log — le
       superadmin verra la liste via l'endpoint list ci-dessous. */
    console.log(`[withdraw] request pubId=${pub._id} amount=${total} method=${method}`);

    res.json({
      success: true,
      withdrawal: {
        status: pub.cagnotteWithdrawal.status,
        method: pub.cagnotteWithdrawal.method,
        account: maskAccount(pub.cagnotteWithdrawal.account),
        requestedAt: pub.cagnotteWithdrawal.requestedAt,
      },
      amount: total,
    });
  } catch (err) {
    console.error('[wallWithdrawal] request failed', err);
    res.status(500).json({ error: err.message });
  }
});

/* POST /api/walls/:pubId/withdraw/confirm  (super_admin uniquement)
   Marque un retrait comme payé. Body : { reference, paidAmount? }.
   Utilisé après le paiement effectif via KKiaPay/mobile money. */
router.post('/:pubId/withdraw/confirm', requireAdmin, async (req, res) => {
  try {
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    const pub = await Publication.findById(req.params.pubId);
    if (!pub) return res.status(404).json({ error: 'Mur introuvable' });
    if (pub.cagnotteWithdrawal?.status !== 'pending') {
      return res.status(400).json({
        error: 'Aucun retrait en attente sur ce mur.',
        code: 'NO_PENDING',
      });
    }
    const reference = String(req.body?.reference || '').trim();
    if (!reference) return res.status(400).json({ error: 'Référence de paiement requise.' });

    const { total } = await cagnotteTotalFor(pub._id);
    const paidAmount = Number(req.body?.paidAmount) || total;

    pub.cagnotteWithdrawal.status     = 'paid';
    pub.cagnotteWithdrawal.paidAt     = new Date();
    pub.cagnotteWithdrawal.paidAmount = paidAmount;
    pub.cagnotteWithdrawal.reference  = reference;
    await pub.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* GET /api/walls/withdraw/pending  (super_admin)
   Liste des retraits en attente pour la vue admin. */
router.get('/withdraw/pending', requireAdmin, async (req, res) => {
  try {
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    const pubs = await Publication.find({
      'cagnotteWithdrawal.status': 'pending',
    })
    .select('title data.titleName cagnotteWithdrawal recipientUserId merchantId')
    .sort('-cagnotteWithdrawal.requestedAt')
    .lean();

    res.json({ items: pubs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
