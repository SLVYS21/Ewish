/* ================================================================
   myKado — Notifications API
   ================================================================ */

const router = require('express').Router();
const Notification = require('../models/Notification');
const { requireAdmin } = require('../middleware/auth');

// GET /api/notifications  — liste des notifs de l'utilisateur courant
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { limit = 50, unreadOnly } = req.query;
    const filter = { userId: req.admin._id };
    if (unreadOnly === 'true') filter.read = false;
    const notifs = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(Math.min(parseInt(limit, 10) || 50, 200))
      .lean();
    const unreadCount = await Notification.countDocuments({ userId: req.admin._id, read: false });
    res.json({ notifications: notifs, unreadCount });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', requireAdmin, async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.admin._id },
      { read: true, readAt: new Date() },
      { new: true }
    );
    if (!notif) return res.status(404).json({ error: 'Not found' });
    res.json(notif);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/notifications/read-all
router.post('/read-all', requireAdmin, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.admin._id, read: false },
      { read: true, readAt: new Date() }
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/notifications/:id  (dismiss)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await Notification.deleteOne({ _id: req.params.id, userId: req.admin._id });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
