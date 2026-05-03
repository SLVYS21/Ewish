const router = require('express').Router();
const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');
const { requireAdmin } = require('../middleware/auth');

// POST /api/auth/register (Create a merchant account)
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });

    const existing = await AdminUser.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'Un compte avec cet email existe déjà' });

    const user = new AdminUser({
      email,
      password,
      name: name || 'Marchand',
      role: 'merchant',
    });
    // Use the user's ID as their merchantId
    user.merchantId = user._id.toString();
    
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, merchantId: user.merchantId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.cookie('ww_admin_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ user: user.toSafeObject() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });

    const user = await AdminUser.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Identifiants invalides' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ error: 'Identifiants invalides' });

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, merchantId: user.merchantId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // httpOnly cookie — not accessible from JS
    res.cookie('ww_admin_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',  // Required for cross-domain cookies
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user: user.toSafeObject() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/auth/me
router.get('/me', requireAdmin, async (req, res) => {
  try {
    const user = await AdminUser.findById(req.admin.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json({ user: user.toSafeObject() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('ww_admin_token');
  res.json({ success: true });
});

module.exports = router;