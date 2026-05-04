const router = require('express').Router();
const { requireSuperAdmin } = require('../middleware/auth');
const AdminUser   = require('../models/AdminUser');
const Publication = require('../models/Publication');
const Transaction = require('../models/Transaction');

/* ── GET /api/superadmin/stats ── Plateforme overview */
router.get('/stats', requireSuperAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      newUsers30d,
      totalPubs,
      publishedPubs,
      totalCredits,
      revenueResult
    ] = await Promise.all([
      AdminUser.countDocuments({ role: { $in: ['merchant', 'admin'] } }),
      AdminUser.countDocuments({
        role: { $in: ['merchant', 'admin'] },
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),
      Publication.countDocuments({}),
      Publication.countDocuments({ published: true }),
      AdminUser.aggregate([
        { $match: { role: { $in: ['merchant', 'admin'] } } },
        { $group: { _id: null, total: { $sum: '$credits' } } },
      ]),
      Transaction.aggregate([
        { $match: { status: 'SUCCESS' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ])
    ]);

    // Top templates
    const topTemplates = await Publication.aggregate([
      { $group: { _id: '$templateName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      totalUsers,
      newUsers30d,
      totalPubs,
      publishedPubs,
      totalCredits: totalCredits[0]?.total || 0,
      totalRevenue: revenueResult[0]?.total || 0,
      topTemplates,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── GET /api/superadmin/transactions ── Historique des transactions */
router.get('/transactions', requireSuperAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find()
        .populate('adminId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Transaction.countDocuments(),
    ]);

    res.json({ transactions, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── GET /api/superadmin/users ── Liste marchands + stats */
router.get('/users', requireSuperAdmin, async (req, res) => {
  try {
    const { search = '', page = 1, limit = 30 } = req.query;
    const skip = (page - 1) * limit;

    const query = { role: { $in: ['merchant', 'admin'] } };
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name:  { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      AdminUser.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      AdminUser.countDocuments(query),
    ]);

    // Attach pub counts per user
    const merchantIds = users.map(u => u.merchantId).filter(Boolean);
    const pubCounts = await Publication.aggregate([
      { $match: { merchantId: { $in: merchantIds } } },
      { $group: { _id: '$merchantId', total: { $sum: 1 }, published: { $sum: { $cond: ['$published', 1, 0] } } } },
    ]);
    const pubMap = Object.fromEntries(pubCounts.map(p => [p._id, p]));

    const enriched = users.map(u => ({
      ...u,
      pubStats: pubMap[u.merchantId] || { total: 0, published: 0 },
    }));

    res.json({ users: enriched, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── GET /api/superadmin/users/:id ── Détail marchand */
router.get('/users/:id', requireSuperAdmin, async (req, res) => {
  try {
    const user = await AdminUser.findById(req.params.id).select('-password').lean();
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

    const pubs = await Publication.find({ merchantId: user.merchantId })
      .select('title templateName published publishedAt views createdAt shortCode')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({ user, publications: pubs });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── PUT /api/superadmin/users/:id ── Modifier crédits / suspendre */
router.put('/users/:id', requireSuperAdmin, async (req, res) => {
  try {
    const { credits, name, role } = req.body;
    const allowed = {};
    if (credits !== undefined) allowed.credits = parseInt(credits);
    if (name    !== undefined) allowed.name    = name;
    // Only allow promoting to admin, not super_admin via API
    if (role    !== undefined && ['admin', 'merchant'].includes(role)) allowed.role = role;

    const user = await AdminUser.findByIdAndUpdate(req.params.id, allowed, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json({ user });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── DELETE /api/superadmin/users/:id ── Supprimer marchand */
router.delete('/users/:id', requireSuperAdmin, async (req, res) => {
  try {
    const user = await AdminUser.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    if (user.role === 'super_admin') return res.status(403).json({ error: 'Impossible de supprimer un super admin' });
    await AdminUser.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
