const router  = require('express').Router();
const Publication = require('../models/Publication');
const { nanoid } = require('nanoid');
const slugify = require('slugify');

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

/* ── GET /s/:code — public redirect ──────────────────────────── */
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
    // Permanent redirect to full URL
    res.redirect(301, `/site/${pub.templateName}/${pub.customName}`);
  } catch (e) {
    res.status(500).send('<h1>Erreur serveur</h1>');
  }
});

/* ── POST /api/shortlinks/:id — generate or return existing ───── */
// Called by the editor when a publication is published
router.post('/:id', async (req, res) => {
  try {
    const pub = await Publication.findById(req.params.id);
    if (!pub) return res.status(404).json({ error: 'Not found' });

    // Already has a short code — just return it
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

/* ── PATCH /api/shortlinks/:id — set custom slug ─────────────── */
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