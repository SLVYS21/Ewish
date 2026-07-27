/* ================================================================
   FeexPay — endpoints génériques pour le flow "payer pour publier"
   (mur premium/infinite ou carte).
   ---------------------------------------------------------------
   Pour le flow contribution cagnotte, voir contributions.js
   (endpoints contextualisés à une publication + gestion SSE + notifs).
   ================================================================ */

const router  = require('express').Router();
const feexpay = require('../services/feexpay');
const { requireAdmin } = require('../middleware/auth');

/* POST /api/feexpay/init  (auth)
   Body : { amount, operator, phone?, description?, customId? }
     - operator = 'card' → initCard (renvoie redirectUrl)
     - sinon              → initMobileMoney (phone requis)
   Renvoie { reference, redirectUrl? } */
router.post('/init', requireAdmin, async (req, res) => {
  try {
    const { amount, operator, phone, description, customId } = req.body || {};
    const amt = Number(amount);
    if (!amt || amt <= 0) return res.status(400).json({ error: 'Montant invalide' });
    if (!operator)        return res.status(400).json({ error: 'Opérateur requis' });

    const commonMeta = {
      amount:      amt,
      description: description || 'Paiement myKado',
      customId:    customId || `admin:${req.admin.id}`,
      email:       req.admin?.email || '',
    };

    if (String(operator).toLowerCase() === 'card') {
      const out = await feexpay.initCard(commonMeta);
      return res.json({ reference: out.reference, redirectUrl: out.redirectUrl });
    }

    if (!phone) return res.status(400).json({ error: 'Numéro requis pour Mobile Money' });

    const out = await feexpay.initMobileMoney({ ...commonMeta, phone, operator });
    res.json({ reference: out.reference });
  } catch (e) {
    console.error('[feexpay/init]', e.message);
    res.status(500).json({ error: e.data?.message || e.message });
  }
});

/* GET /api/feexpay/status/:reference  (public — pas de PII dans la réponse)
   Utilisé pour poller pendant que l'utilisateur confirme sur son téléphone. */
router.get('/status/:reference', async (req, res) => {
  try {
    const out = await feexpay.verify(req.params.reference);
    res.json({ status: out.status, amount: out.amount, reference: out.reference });
  } catch (e) {
    res.status(500).json({ error: e.message, status: 'PENDING' });
  }
});

module.exports = router;
