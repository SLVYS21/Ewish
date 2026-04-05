const router  = require('express').Router();
const Order   = require('../models/Order');

/* ── Générer une référence lisible ───────────────────────────── */
function genRef() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'EW-';
  for (let i = 0; i < 6; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
}

/* ── POST /api/orders/public ─────────────────────────────────── */
// Route publique — pas d'auth requise
router.post('/public', async (req, res) => {
  try {
    const {
      template, senderName, senderPhone,
      recipientName, occasion, delay, notes,
    } = req.body;

    // Validation basique
    if (!template)       return res.status(400).json({ error: 'Template requis' });
    if (!senderName)     return res.status(400).json({ error: 'Ton prénom est requis' });
    if (!senderPhone)    return res.status(400).json({ error: 'Ton numéro WhatsApp est requis' });
    if (!recipientName)  return res.status(400).json({ error: 'Le prénom du destinataire est requis' });

    // Générer une référence unique (retry si collision)
    let ref, exists;
    let attempts = 0;
    do {
      ref = genRef();
      exists = await Order.findOne({ ref });
      attempts++;
    } while (exists && attempts < 10);

    const order = await Order.create({
      ref,
      status:        'nouveau',
      templateName:  template,
      senderName,
      senderPhone,
      recipientName,
      occasion:      occasion || '',
      delay:         delay    || 'flexible',
      notes:         notes    || '',
      source:        'public',
    });

    res.status(201).json({ success: true, ref: order.ref });

  } catch (e) {
    console.error('[orders/public]', e.message);
    res.status(500).json({ error: 'Erreur serveur. Réessaie dans un moment.' });
  }
});

module.exports = router;

/* ── POST /api/orders/:ref/details ──────────────────────────── */
// Reçoit les données du formulaire client et les stocke sur la commande
router.post('/:ref/details', async (req, res) => {
  try {
    const order = await Order.findOne({ ref: req.params.ref });
    if (!order) return res.status(404).json({ error: 'Commande introuvable' });

    const { templateData } = req.body;
    if (!templateData) return res.status(400).json({ error: 'Données manquantes' });

    order.templateData = templateData;
    order.status = 'en_cours';
    await order.save();

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});