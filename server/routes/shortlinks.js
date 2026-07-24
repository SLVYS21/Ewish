const router  = require('express').Router();
const Publication = require('../models/Publication');
const { nanoid } = require('nanoid');
const slugify = require('slugify');

/* Détermine l'URL du frontend React (routes /c /m /g) pour cette
   requête. Priorité :
   1. Requête sur localhost (dev) → :3000, peu importe NODE_ENV/APP_URL.
      Évite qu'un .env local avec APP_URL=prod ne casse le test local.
   2. Sinon, si APP_URL explicite dans l'env → l'utiliser.
   3. Sinon, dériver de req.protocol + APP_HOST (prod).
   4. Fallback : mêmes host que la requête (single-origin). */
function resolveAppUrl(req) {
  const host = String(req.hostname || '').toLowerCase();
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
  if (isLocal) return 'http://localhost:3000';
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/+$/, '');
  if (process.env.APP_HOST) return `${req.protocol}://${process.env.APP_HOST}`;
  return `${req.protocol}://${req.get('host')}`;
}

function preserveQuery(req, path) {
  const qs = req.originalUrl.split('?')[1];
  return qs ? `${path}?${qs}` : path;
}

/* ── Helpers ──────────────────────────────────────────────────── */

// Generate a random 6-char code, retry if collision
async function generateUniqueCode() {
  for (let i = 0; i < 10; i++) {
    const code = nanoid(6); // e.g. "xK3p2Z"
    const exists = await Publication.findOne({ shortCode: code }).lean();
    if (!exists) return code;
  }
  throw new Error('Could not generate unique short code');
}

// Build a slug from pub data (name + occasion/template) e.g. "myril-birthday"
function buildSlug(pub) {
  const name = pub.data?.name || pub.data?.recipientName || '';
  const occasion = pub.templateName?.replace('collective-', '') || '';
  const raw = [name, occasion].filter(Boolean).join('-');
  return slugify(raw, { lower: true, strict: true }).slice(0, 30) || null;
}

/* ── GET /s/:code  public redirect ────────────────────────────
   Backward compat non négociable — cartes déjà livrées.
   Voir notes/sitemap.md §Backward compat.
   Redirige vers /c|/m|/g/:slug si disponible, sinon fallback /site/... */
router.get('/:code', async (req, res) => {
  try {
    const pub = await Publication.findOne({ shortCode: req.params.code }).lean();
    if (!pub || !pub.published) {
      return res.status(404).send(`
        <html><body style="font-family:sans-serif;text-align:center;padding:80px;background:#fafafa">
          <h1>404</h1><p>Lien introuvable ou non publié.</p>
        </body></html>
      `);
    }

    /* Toutes les briques canoniques (/c /m /g) sont servies par le
       frontend React → on doit rediriger vers APP_URL absolu, sinon on
       tombe sur la landing (dev, port 5000) ou 404 (prod si séparé).
       Query string (?collect=1 pour le lien invité) préservé. */
    /* Routing par brique :
       - MUR : React SPA gère /m/:slug (RecipientReveal + iframe wall)
         → redirect ABSOLU vers APP_URL (frontend React)
       - CARTE : canonical.js sur ce serveur gère /c/:slug → /site/…
         → redirect RELATIF (même host, même serveur SSR)
       - CADEAU : idem carte via /g/:slug
       - Fallback legacy sans slug : /site/… direct (cartes historiques
         déjà livrées aux clients — backward compat non négociable).

       302 (temporaire) volontaire : la cible dépend du host + config,
       un 301 se serait fait cacher indéfiniment par le navigateur. */
    const brique = pub.brique;

    if (pub.slug && brique === 'mur') {
      const appUrl = resolveAppUrl(req);
      return res.redirect(302, preserveQuery(req, `${appUrl}/m/${pub.slug}`));
    }

    if (pub.slug && (brique === 'carte' || brique === 'cadeau')) {
      const prefix = brique === 'carte' ? 'c' : 'g';
      return res.redirect(302, preserveQuery(req, `/${prefix}/${pub.slug}`));
    }

    // Mur legacy sans slug/brique → shortCode via React
    if (pub.templateName && pub.templateName.startsWith('wall-of-wishes')) {
      const appUrl = resolveAppUrl(req);
      return res.redirect(302, preserveQuery(req, `${appUrl}/m/${pub.shortCode}`));
    }

    // Cartes/cadeaux legacy sans slug (URLs déjà livrées aux clients).
    // Rendu SSR direct par /site/… — surtout NE PAS toucher.
    res.redirect(302, preserveQuery(req, `/site/${pub.templateName}/${pub.customName}`));
  } catch (e) {
    res.status(500).send('<h1>Erreur serveur</h1>');
  }
});

/* ── POST /api/shortlinks/:id  generate or return existing ───── */
// Called by the editor when a publication is published
router.post('/:id', async (req, res) => {
  try {
    const pub = await Publication.findById(req.params.id);
    if (!pub) return res.status(404).json({ error: 'Not found' });

    // Already has a short code  just return it
    if (pub.shortCode) {
      return res.json({ shortCode: pub.shortCode });
    }

    // Try slug first, then random fallback
    let code = null;
    const slug = buildSlug(pub);
    if (slug) {
      const taken = await Publication.findOne({ shortCode: slug }).lean();
      if (!taken) code = slug;
    }
    if (!code) code = await generateUniqueCode();

    pub.shortCode = code;
    await pub.save();

    res.json({ shortCode: code });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── PATCH /api/shortlinks/:id  set custom slug ─────────────── */
router.patch('/:id', async (req, res) => {
  try {
    const { slug } = req.body;
    if (!slug) return res.status(400).json({ error: 'slug requis' });

    const code = slugify(slug, { lower: true, strict: true }).slice(0, 40);
    if (code.length < 2) return res.status(400).json({ error: 'Slug trop court' });

    const taken = await Publication.findOne({ shortCode: code, _id: { $ne: req.params.id } }).lean();
    if (taken) return res.status(409).json({ error: 'Ce slug est déjà pris' });

    const pub = await Publication.findByIdAndUpdate(
      req.params.id,
      { shortCode: code },
      { new: true }
    );
    if (!pub) return res.status(404).json({ error: 'Not found' });

    res.json({ shortCode: code });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;