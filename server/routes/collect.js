const router      = require('express').Router();
const path        = require('path');
const fs          = require('fs');
const Publication = require('../models/Publication');
const Contribution = require('../models/Contribution');
const Wish        = require('../models/Wish');

const TEMPLATES_DIR = process.env.TEMPLATES_DIR ||
  (fs.existsSync(path.join(__dirname, '../templates'))
    ? path.join(__dirname, '../templates')
    : path.join(__dirname, '../../templates'));

const EMOJI_MAP = {
  birthday: '🎂', special: '✨', 'collective-family': '🎉',
  'collective-pro': '🏆', forever: '💕', 'notre-film': '🎬',
  'wall-of-wishes': '💌', sanctuary: '🌸',
};

const COLORS = ['#FFB3C1', '#D7C5F2', '#C9EEDF', '#FFDBA4', '#B3D4FF', '#FFC8E8', '#C8F0FF'];

function errPage(msg) {
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>myKado</title>
<style>*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Plus Jakarta Sans',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#FFFAF6;text-align:center}
.box{padding:48px 32px;max-width:360px}.emoji{font-size:3rem;margin-bottom:16px}
h1{color:#2B1A2D;font-size:1.3rem;margin-bottom:8px;font-weight:800}
p{color:#9E8BA3;font-size:.9rem;line-height:1.5}</style>
</head><body><div class="box"><div class="emoji">🙈</div><h1>Oops !</h1><p>${msg}</p></div></body></html>`;
}

router.get('/:pubId', async (req, res) => {
  try {
    const pub = await Publication.findById(req.params.pubId).lean();
    if (!pub) return res.status(404).send(errPage('Ce lien de collecte n\'existe pas ou a expiré.'));

    const [wishCount, recentWishes, contribs] = await Promise.all([
      Wish.countDocuments({ publicationId: req.params.pubId, approved: true }),
      Wish.find({ publicationId: req.params.pubId, approved: true })
        .sort('-createdAt').limit(5).lean(),
      pub.cagnotteConfig?.enabled
        ? Contribution.find({ publicationId: req.params.pubId, status: 'confirmed' }).lean()
        : Promise.resolve([]),
    ]);

    const collected    = contribs.reduce((s, c) => s + (c.amount || 0), 0);
    const contributors = contribs.length;

    const pageData = {
      publicationId: req.params.pubId,
      apiBase: '',
      recipient: pub.data?.name || pub.title || 'quelqu\'un de spécial',
      occasion:  pub.data?.occasion  || 'anniversaire',
      age:       pub.data?.age       || '',
      emoji:     EMOJI_MAP[pub.templateName] || '🎉',
      host:      pub.data?.groupName || pub.data?.hostName || 'Le groupe',
      date:      pub.data?.date      || '',
      wishCount,
      recentWishes: recentWishes.map((w, i) => ({
        name:  w.firstName,
        text:  w.message.slice(0, 60) + (w.message.length > 60 ? '…' : ''),
        color: COLORS[i % COLORS.length],
      })),
      wallUrl: '',
      appUrl: 'https://mykado.store',
      cagnotte: {
        enabled:      !!pub.cagnotteConfig?.enabled,
        name:         pub.cagnotteConfig?.description || 'Cadeau commun',
        emoji:        '🎁',
        goal:         pub.cagnotteConfig?.goal || 0,
        deadline:     pub.cagnotteConfig?.deadline || null,
        collected,
        contributors,
      },
      kkiapayKey:     process.env.KKIAPAY_PUBLIC_KEY || '',
      kkiapaySandbox: process.env.KKIAPAY_SANDBOX === 'true',
    };

    const htmlPath = path.join(TEMPLATES_DIR, 'collect', 'index.html');
    if (!fs.existsSync(htmlPath)) {
      return res.status(500).send(errPage('Page de collecte non trouvée. Contactez le support.'));
    }
    let html = fs.readFileSync(htmlPath, 'utf8');
    html = html.replace('/* __WW_DATA__ */', `window.__WW_DATA__ = ${JSON.stringify(pageData)};`);
    res.send(html);
  } catch (e) {
    console.error('[collect]', e);
    res.status(500).send(errPage('Une erreur est survenue. Réessaie dans un instant.'));
  }
});

module.exports = router;
