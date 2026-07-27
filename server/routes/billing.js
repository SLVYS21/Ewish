const router = require('express').Router();
const AdminUser = require('../models/AdminUser');
const Transaction = require('../models/Transaction');
const { requireAdmin } = require('../middleware/auth');

/* ---------------------------------------------------------------- *
   Ce fichier historiquement hébergeait :
     - POST /buy-credits        (achat de crédits KKiaPay)
     - POST /kkiapay-verify     (vérif d'achat de crédits KKiaPay)
   Ces routes ont été retirées lors du passage à FeexPay : les crédits
   ne sont plus vendus, ils restent utilisables jusqu'à épuisement (voir
   `publication.js` — chemin "crédits legacy" au publish). Les
   Transaction déjà en base sont conservées à des fins d'historique.
   Seul /apply-promo (indépendant de KKiaPay) est gardé.
 * ---------------------------------------------------------------- */

router.post('/apply-promo', requireAdmin, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Code requis' });

    const Promo = require('../models/Promo');
    const promo = await Promo.findOne({ code: code.toUpperCase() });
    if (!promo) return res.status(404).json({ error: 'Code promo invalide' });

    const user = await AdminUser.findById(req.admin.id);
    const check = promo.isValid(0, user._id); // 0 amount for gift check
    if (!check.ok) return res.status(400).json({ error: check.reason });

    if (promo.isCreditGift) {
      // Direct credit gift
      user.credits = (user.credits || 0) + promo.creditAmount;
      promo.usedCount += 1;
      promo.usedBy.push(user._id);

      await Promise.all([user.save(), promo.save()]);

      // Log transaction
      const tx = new Transaction({
        adminId: user._id,
        transactionId: `GIFT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        amount: 0,
        credits: promo.creditAmount,
        status: 'SUCCESS',
        source: 'promo_gift',
        paymentData: { promoCode: promo.code }
      });
      await tx.save();

      return res.json({
        success: true,
        isGift: true,
        credits: user.credits,
        added: promo.creditAmount,
        message: `Félicitations ! ${promo.creditAmount} crédits ont été ajoutés à votre compte.`
      });
    } else {
      // Discount promo (percentage or fixed)
      return res.json({
        success: true,
        isGift: false,
        type: promo.type,
        value: promo.value,
        description: promo.description
      });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
