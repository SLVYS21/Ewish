/* ================================================================
   myKado — UserDates API
   CRUD des dates importantes de l'utilisateur (rappels J-3 / J-1).
   ================================================================ */

const router = require('express').Router();
const UserDate = require('../models/UserDate');
const { requireAdmin } = require('../middleware/auth');

const OCCASIONS = UserDate.OCCASIONS;

function normalizePayload(body) {
  const { name, occasion, month, day, originYear, date } = body || {};
  const out = {};

  if (typeof name === 'string') out.name = name.trim().slice(0, 80);
  if (occasion && OCCASIONS.includes(occasion)) out.occasion = occasion;

  // Deux formats acceptés :
  //   - { month, day, originYear? }
  //   - { date: "YYYY-MM-DD" }
  if (date) {
    const d = new Date(date);
    if (!isNaN(d.getTime())) {
      out.month = d.getUTCMonth() + 1;
      out.day = d.getUTCDate();
      out.originYear = d.getUTCFullYear();
    }
  }
  const m = Number(month), dd = Number(day), y = Number(originYear);
  if (m >= 1 && m <= 12) out.month = m;
  if (dd >= 1 && dd <= 31) out.day = dd;
  if (y >= 1900 && y <= 2100) out.originYear = y;

  return out;
}

/* ── GET /api/user-dates — liste triée par prochaine occurrence ── */
router.get('/', requireAdmin, async (req, res) => {
  try {
    const dates = await UserDate.find({ userId: req.admin._id }).lean();

    const today = new Date();
    const y = today.getUTCFullYear();
    const enriched = dates.map((d) => {
      const nextY = (d.month > today.getUTCMonth() + 1 ||
        (d.month === today.getUTCMonth() + 1 && d.day >= today.getUTCDate())) ? y : y + 1;
      const nextDate = new Date(Date.UTC(nextY, d.month - 1, d.day));
      const daysUntil = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
      return { ...d, nextDate: nextDate.toISOString(), daysUntil };
    }).sort((a, b) => a.daysUntil - b.daysUntil);

    res.json({ dates: enriched, occasions: OCCASIONS });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── POST /api/user-dates — créer ── */
router.post('/', requireAdmin, async (req, res) => {
  try {
    const payload = normalizePayload(req.body);
    if (!payload.name) return res.status(400).json({ error: 'Nom requis' });
    if (!payload.month || !payload.day) return res.status(400).json({ error: 'Date requise' });

    const created = await UserDate.create({ ...payload, userId: req.admin._id });
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── PATCH /api/user-dates/:id — modifier ── */
router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const payload = normalizePayload(req.body);
    const updated = await UserDate.findOneAndUpdate(
      { _id: req.params.id, userId: req.admin._id },
      payload,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Non trouvé' });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── DELETE /api/user-dates/:id ── */
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await UserDate.findOneAndDelete({
      _id: req.params.id,
      userId: req.admin._id,
    });
    if (!deleted) return res.status(404).json({ error: 'Non trouvé' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
