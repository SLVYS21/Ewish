const router = require('express').Router();
const AdminUser = require('../models/AdminUser');
const { requireAdmin } = require('../middleware/auth');

router.post('/buy-credits', requireAdmin, async (req, res) => {
  try {
    const { amount } = req.body;
    const creditsToBuy = parseInt(amount);
    
    if (!creditsToBuy || creditsToBuy <= 0) {
      return res.status(400).json({ error: 'Montant invalide' });
    }
    
    // TODO: Plus tard, ceci devrait générer une session Stripe (stripe.checkout.sessions.create)
    // et les crédits seront ajoutés via un Webhook Stripe.
    // Pour l'instant on ajoute directement les crédits pour tester le système.
    
    const user = await AdminUser.findById(req.admin.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

    user.credits = (user.credits || 0) + creditsToBuy;
    await user.save();
    
    res.json({ success: true, credits: user.credits });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
