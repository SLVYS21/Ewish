const router = require('express').Router();
const { requireSuperAdmin } = require('../middleware/auth');
const Prospect = require('../models/Prospect');

/* ── GET /api/prospects ── List all */
router.get('/', requireSuperAdmin, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { contactName: { $regex: search, $options: 'i' } },
        { activity:    { $regex: search, $options: 'i' } },
      ];
    }
    const [items, total] = await Promise.all([
      Prospect.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)).lean(),
      Prospect.countDocuments(filter),
    ]);
    res.json({ items, total });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── POST /api/prospects ── Create */
router.post('/', requireSuperAdmin, async (req, res) => {
  try {
    const { companyName, contactName, activity, phone, instagram, facebook, source, notes, messageTemplate } = req.body;
    if (!companyName?.trim()) return res.status(400).json({ error: 'Nom de l\'entreprise requis' });
    // Build default message template
    const defaultMsg = messageTemplate || buildDefaultMessage({ companyName, contactName, activity });
    const prospect = await Prospect.create({
      companyName: companyName.trim(),
      contactName: contactName?.trim() || '',
      activity:    activity?.trim() || '',
      phone:       phone?.trim() || '',
      instagram:   instagram?.trim() || '',
      facebook:    facebook?.trim() || '',
      source:      source?.trim() || '',
      notes:       notes?.trim() || '',
      messageTemplate: defaultMsg,
    });
    res.status(201).json(prospect);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── PATCH /api/prospects/:id ── Update */
router.patch('/:id', requireSuperAdmin, async (req, res) => {
  try {
    const allowed = ['companyName','contactName','activity','phone','instagram','facebook','source','notes','messageTemplate','status'];
    const update = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
    if (update.status === 'contacted') update.lastContactedAt = new Date();
    if (update.status === 'converted') update.convertedAt = new Date();
    const p = await Prospect.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!p) return res.status(404).json({ error: 'Non trouvé' });
    res.json(p);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── DELETE /api/prospects/:id ── Delete */
router.delete('/:id', requireSuperAdmin, async (req, res) => {
  try {
    await Prospect.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* Helper: build a personalized WhatsApp message */
function buildDefaultMessage({ companyName, contactName, activity }) {
  const name = contactName || companyName;
  const act  = activity ? ` dans le secteur ${activity}` : '';
  return `Bonjour ${name} 👋\n\nJ'ai vu votre activité${act} et j'ai pensé que myKado pourrait vous intéresser.\n\nmyKado vous permet de créer des cartes d'anniversaire et messages animés et personnalisés pour vos clients en quelques minutes ✨\n\nVoulez-vous que je vous fasse une démo rapide ? C'est gratuit pour commencer 🎁\n\nhttps://app.mykado.store`;
}

module.exports = router;
