const jwt = require('jsonwebtoken');

const requireAdmin = (req, res, next) => {
  // Check httpOnly cookie first, then Authorization header
  const token = req.cookies?.ww_admin_token
    || req.headers.authorization?.replace('Bearer ', '');

  if (!token) return res.status(401).json({ error: 'Non authentifié' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
};

module.exports = { requireAdmin };