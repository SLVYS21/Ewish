const router = require('express').Router();
const crypto = require('crypto');
const AdminUser = require('../models/AdminUser');
const { requireAdmin } = require('../middleware/auth');

// POST /api/kyc/submit — authenticated: save KYC with uploaded photo URLs
router.post('/submit', requireAdmin, async (req, res) => {
  try {
    const { fullName, idType, documentUrl, selfieUrl } = req.body;
    if (!fullName || !documentUrl) {
      return res.status(400).json({ error: 'Nom et photo du document requis' });
    }
    const user = await AdminUser.findById(req.admin.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    Object.assign(user, {
      kycName: fullName,
      kycDocumentUrl: documentUrl,
      kycSelfieUrl: selfieUrl || '',
      kycStatus: 'pending',
      kycSubmittedAt: new Date(),
      kycRejectionReason: '',
    });
    await user.save();
    res.json({ success: true, kycStatus: 'pending' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/kyc/status
router.get('/status', requireAdmin, async (req, res) => {
  try {
    const user = await AdminUser.findById(req.admin.id).lean();
    res.json({
      kycStatus: user.kycStatus || 'none',
      kycMethod: user.kycMethod || '',
      kycPhone: user.kycPhone || '',
      kycDocumentUrl: user.kycDocumentUrl || '',
      kycSelfieUrl: user.kycSelfieUrl || '',
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/kyc/mobile-token — generate short-lived token for mobile continuation
router.post('/mobile-token', requireAdmin, async (req, res) => {
  try {
    const token = crypto.randomBytes(24).toString('hex');
    const expiry = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2h
    await AdminUser.findByIdAndUpdate(req.admin.id, {
      kycMobileToken: token,
      kycMobileTokenExpiry: expiry,
    });
    res.json({ token, expiry });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/kyc/mobile-verify/:token — public: check if token is valid
router.get('/mobile-verify/:token', async (req, res) => {
  try {
    const user = await AdminUser.findOne({
      kycMobileToken: req.params.token,
      kycMobileTokenExpiry: { $gt: new Date() },
    }).lean();
    if (!user) return res.status(404).json({ error: 'Lien invalide ou expiré' });
    res.json({ valid: true, userId: user._id, kycStatus: user.kycStatus, name: user.name });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/kyc/mobile-submit/:token — public: submit KYC from mobile (no auth)
router.post('/mobile-submit/:token', async (req, res) => {
  try {
    const user = await AdminUser.findOne({
      kycMobileToken: req.params.token,
      kycMobileTokenExpiry: { $gt: new Date() },
    });
    if (!user) return res.status(404).json({ error: 'Lien invalide ou expiré' });
    const { fullName, idType, documentUrl, selfieUrl } = req.body;
    if (!documentUrl || !selfieUrl) {
      return res.status(400).json({ error: 'Photo du document et selfie requis' });
    }
    Object.assign(user, {
      kycName: fullName || user.name,
      kycDocumentUrl: documentUrl,
      kycSelfieUrl: selfieUrl,
      kycStatus: 'pending',
      kycSubmittedAt: new Date(),
      kycMobileToken: undefined,
      kycMobileTokenExpiry: undefined,
    });
    await user.save();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/kyc/list — admin only: list KYC submissions
router.get('/list', requireAdmin, async (req, res) => {
  try {
    if (req.admin.role === 'merchant') return res.status(403).json({ error: 'Accès refusé' });
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { kycStatus: status } : { kycStatus: { $ne: 'none' } };
    const [users, total] = await Promise.all([
      AdminUser.find(filter)
        .select('-password -kycMobileToken -kycMobileTokenExpiry')
        .sort('-kycSubmittedAt')
        .skip((+page - 1) * +limit)
        .limit(+limit)
        .lean(),
      AdminUser.countDocuments(filter),
    ]);
    res.json({ users, total, page: +page, pages: Math.ceil(total / limit) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PATCH /api/kyc/:id — admin: approve or reject
router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    if (!['super_admin', 'admin'].includes(req.admin.role)) return res.status(403).json({ error: 'Accès refusé' });
    const { kycStatus, kycRejectionReason } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(kycStatus)) return res.status(400).json({ error: 'Statut invalide' });
    const update = { kycStatus };
    if (kycRejectionReason !== undefined) update.kycRejectionReason = kycRejectionReason;
    const user = await AdminUser.findByIdAndUpdate(req.params.id, update, { new: true })
      .select('-password -kycMobileToken -kycMobileTokenExpiry');
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json({ success: true, kycStatus: user.kycStatus, user });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
