const router = require('express').Router();
const AdminUser = require('../models/AdminUser');
const Transaction = require('../models/Transaction');
const { requireAdmin } = require('../middleware/auth');
const { kkiapay } = require("@kkiapay-org/nodejs-sdk");

// Initialize KKiaPay SDK
const k = kkiapay({
  privatekey: process.env.KKIAPAY_PRIVATE_KEY || 'xxxxxxx',
  publickey: process.env.KKIAPAY_PUBLIC_KEY || 'xxxxxxx',
  secretkey: process.env.KKIAPAY_SECRET_KEY || 'xxxxxxx',
  sandbox: process.env.KKIAPAY_SANDBOX === 'true'
});

router.post('/buy-credits', requireAdmin, async (req, res) => {
  try {
    const { amount } = req.body;
    const creditsToBuy = parseInt(amount);
    
    if (!creditsToBuy || creditsToBuy <= 0) {
      return res.status(400).json({ error: 'Montant invalide' });
    }
    
    const user = await AdminUser.findById(req.admin.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

    user.credits = (user.credits || 0) + creditsToBuy;
    await user.save();
    
    res.json({ success: true, credits: user.credits });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/kkiapay-verify', requireAdmin, async (req, res) => {
  try {
    const { transactionId } = req.body;
    
    if (!transactionId) {
      return res.status(400).json({ error: 'Transaction ID manquant' });
    }

    // Check if transaction already processed
    const existingTx = await Transaction.findOne({ transactionId });
    if (existingTx && existingTx.status === 'SUCCESS') {
      return res.status(400).json({ error: 'Transaction déjà traitée' });
    }

    // Verify with KKiaPay
    k.verify(transactionId).then(async (response) => {
      if (response.status === 'SUCCESS') {
        const amountFCFA = response.amount;
        // 1 crédit = 100 FCFA
        const creditsToBuy = Math.floor(amountFCFA / 100);

        if (creditsToBuy <= 0) {
           return res.status(400).json({ error: 'Montant insuffisant pour des crédits' });
        }

        const user = await AdminUser.findById(req.admin.id);
        if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

        // Save transaction
        const tx = existingTx || new Transaction({
           adminId: user._id,
           transactionId: transactionId,
           amount: amountFCFA,
           credits: creditsToBuy,
           source: 'kkiapay',
           paymentData: response
        });
        tx.status = 'SUCCESS';
        await tx.save();

        user.credits = (user.credits || 0) + creditsToBuy;
        await user.save();

        return res.json({ success: true, credits: user.credits, transaction: tx });
      } else {
        // Save failed transaction optionally
        const tx = existingTx || new Transaction({
           adminId: req.admin.id,
           transactionId: transactionId,
           amount: response.amount || 0,
           credits: 0,
           status: 'FAILED',
           source: 'kkiapay',
           paymentData: response
        });
        await tx.save();

        return res.status(400).json({ error: 'Transaction échouée ou non validée', details: response });
      }
    }).catch((error) => {
      console.error('KKiaPay verification error:', error);
      return res.status(500).json({ error: 'Erreur lors de la vérification KKiaPay', details: error.message });
    });

  } catch (e) {
    console.error('Server error during KKiaPay verify:', e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
