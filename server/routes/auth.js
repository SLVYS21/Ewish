const router  = require('express').Router();
const jwt     = require('jsonwebtoken');
const crypto  = require('crypto');
const fetch   = require('node-fetch');
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

    // httpOnly cookie  not accessible from JS
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

// POST /api/auth/google  verify Google ID token, create/login user
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Token manquant' });

    const gRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    const info = await gRes.json();

    if (!gRes.ok || !info.sub) return res.status(401).json({ error: 'Token Google invalide' });
    if (process.env.GOOGLE_CLIENT_ID && info.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({ error: 'Token Google invalide (audience)' });
    }

    let user = await AdminUser.findOne({
      $or: [{ googleId: info.sub }, { email: info.email.toLowerCase() }],
    });

    if (!user) {
      user = new AdminUser({
        email:    info.email.toLowerCase(),
        name:     info.name || info.email.split('@')[0],
        googleId: info.sub,
        role:     'merchant',
        password: crypto.randomBytes(32).toString('hex'),
      });
      user.merchantId = user._id.toString();
    } else if (!user.googleId) {
      user.googleId = info.sub;
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, merchantId: user.merchantId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.cookie('ww_admin_token', token, {
      httpOnly: true, secure: true, sameSite: 'none',
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

/* ── Brevo transactional email helper ──────────────────────── */
async function sendBrevoEmail({ to, subject, html }) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name:  process.env.BREVO_SENDER_NAME  || 'myKado',
        email: process.env.BREVO_SENDER_EMAIL || 'noreply@mykado.store',
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo ${res.status}: ${body}`);
  }
}

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requis' });

    const user = await AdminUser.findOne({ email: email.toLowerCase() });
    if (!user) return res.json({ success: true }); // silent  no user enumeration

    const token  = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1h
    user.resetPasswordToken  = token;
    user.resetPasswordExpiry = expiry;
    await user.save();

    const resetUrl = `${process.env.APP_URL || 'https://app.mykado.store'}/ewish-admin/reset-password/${token}`;
    const expiryStr = expiry.toLocaleString('fr-FR', { timeZone: 'Africa/Dakar' });

    await sendBrevoEmail({
      to: user.email,
      subject: 'Réinitialiser votre mot de passe  myKado',
      html: `
        <div style="font-family:'Plus Jakarta Sans',system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#FFFAF6;border-radius:16px">
          <div style="text-align:center;margin-bottom:28px">
            <div style="font-size:2.5rem;line-height:1">🎁</div>
            <div style="font-size:1.3rem;font-weight:800;color:#2B1A2D;margin-top:8px">myKado</div>
          </div>
          <h2 style="font-size:1.05rem;font-weight:700;color:#2B1A2D;margin:0 0 10px">Réinitialisation du mot de passe</h2>
          <p style="color:#7A6A7D;font-size:0.88rem;line-height:1.65;margin:0 0 24px">
            Tu as demandé à réinitialiser ton mot de passe. Clique sur le bouton ci-dessous.<br>
            Ce lien expire dans <strong>1 heure</strong> (${expiryStr}).
          </p>
          <a href="${resetUrl}"
             style="display:inline-block;padding:13px 32px;background:linear-gradient(135deg,#FF6F8B,#E11D48);color:#fff;text-decoration:none;border-radius:999px;font-weight:700;font-size:0.9rem;margin-bottom:24px">
            Réinitialiser mon mot de passe →
          </a>
          <p style="color:#B4A4B8;font-size:0.75rem;line-height:1.5;margin:0">
            Si tu n'es pas à l'origine de cette demande, ignore cet email  ton mot de passe reste inchangé.
          </p>
        </div>
      `,
    });

    res.json({ success: true });
  } catch (e) {
    console.error('[forgot-password]', e.message);
    res.status(500).json({ error: 'Erreur lors de l\'envoi. Réessaie dans un instant.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token et nouveau mot de passe requis' });
    if (password.length < 6) return res.status(400).json({ error: 'Mot de passe trop court (6 caractères min.)' });

    const user = await AdminUser.findOne({
      resetPasswordToken:  token,
      resetPasswordExpiry: { $gt: new Date() },
    });
    if (!user) return res.status(400).json({ error: 'Lien invalide ou expiré.' });

    user.password            = password;
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;