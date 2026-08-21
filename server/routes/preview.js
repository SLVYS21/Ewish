const router = require('express').Router();
const Template = require('../models/Template');
const { getTemplateHtml } = require('../utils/templateCache');
const {
  safeJsonForScript,
  safeColor,
  safeFontFamily,
  isSafeTemplateName,
} = require('../utils/htmlSafe');
const { getReactWallShell } = require('../utils/reactWallShell');

const DEMO_DATA = {
  'birthday': {
    recipient: 'Léa',
    titleName: 'Léa',
    age: '25',
    message: 'Joyeux 25ème anniversaire à la plus merveilleuse des personnes ! Que cette nouvelle année t\'apporte une pluie de bonheur, d\'amour et de succès.',
    sender: 'De la part de toute la famille & tes amis ❤️',
    bgKey: 'festi',
  },
  'booklet': {
    recipient: 'Émilie',
    titleName: 'Émilie',
    age: '30 ans',
    message: 'Un très joyeux anniversaire ! Que cette nouvelle décennie soit remplie de surprises et de beaux projets.',
    sender: 'Tes amis pour la vie ✨',
    bgKey: 'luxury_paper',
  },
  'envelope': {
    recipient: 'Maxime',
    titleName: 'Maxime',
    message: 'Félicitations pour cette belle réussite ! Nous sommes très fiers de toi.',
    sender: 'Maman & Papa ❤️',
    bgKey: 'elegant_dark',
  },
  'forever': {
    recipient: 'Sarah & Marc',
    titleName: 'Sarah & Marc',
    message: 'Toutes nos félicitations pour votre magnifique mariage ! Que votre amour continue de grandir et d\'illuminer vos vies chaque jour.',
    sender: 'Vos amis qui vous aiment très fort 💍',
  },
  'collective-pro': {
    recipient: 'Thomas',
    titleName: 'Thomas',
    message: 'Merci pour ces 4 superbes années parmi nous ! Tu vas énormément manquer à l\'équipe. Plein de succès dans ta nouvelle aventure pro !',
    sender: 'Toute l\'équipe Produit & Tech 🚀',
  },
  'collective-family': {
    recipient: 'Noah',
    titleName: 'Noah',
    message: 'Bienvenue dans notre monde petit ange Noah ! Félicitations aux nouveaux parents. Hâte de te dorloter et de te voir grandir.',
    sender: 'Papi, Mamie et toute la famille 👶',
  },
  'special': {
    recipient: 'Alexandre',
    titleName: 'Alexandre',
    message: 'Félicitations pour cette superbe promotion et cette nouvelle étape ! Ton travail acharné porte ses fruits, nous sommes tous très fiers.',
    sender: 'Tes proches & collègues',
  },
  'sanctuary': {
    recipient: 'Gabriel',
    titleName: 'Gabriel',
    message: 'En hommage à une personne d\'une bienveillance exceptionnelle. Ton souvenir et ta générosité restent à jamais gravés dans nos cœurs.',
    sender: 'Tes proches pour l\'éternité 🕊️',
  },
  'notre-film': {
    recipient: 'Camille',
    titleName: 'Camille',
    message: 'Chaque souvenir partagé avec toi est un chef-d\'œuvre. Merci pour ces années de rires et de complicité magique.',
    sender: 'Avec tout mon amour ❤️',
  },
  'wall-of-wishes': {
    recipient: 'Lucas',
    titleName: '30 ans de Lucas',
    theme: 'rose',
    wishes: [
      { id: 'w1', author: 'Léa', text: 'Joyeux anniversaire Lucas ! Toujours le sourire et la bonne humeur, ne change rien 🎉🎂', color: '#FFF3BF', date: 'il y a 2h' },
      { id: 'w2', author: 'Julien & Chloé', text: '30 ans, le bel âge ! Profite à fond de ta journée mon ami 🥂✨', color: '#D3F9D8', date: 'il y a 4h' },
      { id: 'w3', author: 'Sarah (RH)', text: 'Un immense joyeux anniversaire de la part de toute la team ! 🎈', color: '#FFE3E3', date: 'il y a 6h' },
      { id: 'w4', author: 'Maxime', text: 'On fête ça dignement ce week-end ! Prépare-toi 🔥', color: '#E7F5FF', date: 'hier' }
    ]
  },
  'wall-of-wishes-modern': {
    recipient: 'Thomas',
    titleName: 'Pot de départ de Thomas',
    theme: 'purple',
    wishes: [
      { id: 'w1', author: 'Julie', text: 'Un plaisir d\'avoir bossé avec toi ! Bon vent pour la suite 🚀', color: '#EDE7FF', date: 'il y a 1h' },
      { id: 'w2', author: 'Marc', text: 'Merci pour tout le coaching ! Tu vas laisser un grand vide dans l\'équipe.', color: '#FFF3BF', date: 'il y a 3h' },
      { id: 'w3', author: 'David', text: 'Reste en contact ! On t\'attend au prochain afterwork 🍻', color: '#D3F9D8', date: 'il y a 5h' }
    ]
  },
  'wall-of-wishes-space': {
    recipient: 'Équipe',
    titleName: 'Lancement Réussi 🚀',
    theme: 'space',
    wishes: [
      { id: 'w1', author: 'Direction', text: 'Bravo à tous pour ce lancement record ! Félicitations à toute la team.', color: '#FFE3E3', date: 'il y a 1h' }
    ]
  }
};

/* ── Anti-copy layer (friction UX, PAS de la sécurité) ────
   Bloque le clic droit / F12 / drag pour décourager la copie.
   `view-source:` et `curl` contournent tout : ce n'est pas de
   la protection, juste de la friction visuelle.

   NOTE: the visible watermark overlay ("DÉMO MYKADO" diagonal) has
   been removed — templates now render clean in the in-app preview.
   The anti-copy handlers below stay in place.
*/
function injectProtection(html) {
  const selectionCss = `
<style id="ww-demo-style">
  * { -webkit-user-select: none !important; user-select: none !important; }
</style>`;

  const protectionScript = `
<script id="ww-demo-guard">
(function(){
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('keydown', function(e) {
    var blocked = e.key === 'F12'
      || (e.ctrlKey && ['u','s','i','j','p'].includes(e.key.toLowerCase()))
      || (e.metaKey && ['u','s'].includes(e.key.toLowerCase()))
      || (e.ctrlKey && e.shiftKey && ['i','j','c'].includes(e.key.toLowerCase()));
    if (blocked) e.preventDefault();
  });
  document.addEventListener('dragstart', e => e.preventDefault());
})();
<\/script>`;

  html = html.replace('</head>', selectionCss + '\n</head>');
  html = html.replace('</body>', protectionScript + '\n</body>');
  return html;
}

const GFONTS_MAP = {
  'Outfit':           'Outfit:wght@200;300;400;500;600;700;800',
  'Work Sans':        'Work+Sans:wght@300;400;500;600;700',
  'Inter':            'Inter:wght@300;400;500;600;700',
  'Playfair Display': 'Playfair+Display:wght@400;500;600;700',
  'Pacifico':         'Pacifico',
  'Dancing Script':   'Dancing+Script:wght@400;500;600;700',
  'Montserrat':       'Montserrat:wght@300;400;500;600;700',
  'Poppins':          'Poppins:wght@300;400;500;600;700',
  'Lato':             'Lato:wght@300;400;700',
  'Raleway':          'Raleway:wght@300;400;500;600;700',
  'Nunito':           'Nunito:wght@300;400;500;600;700',
};

const CSP = [
  "default-src 'self' https: data: blob:",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http://localhost:* ws://localhost:* http://127.0.0.1:* ws://127.0.0.1:*",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com http://localhost:* ws://localhost:* http://127.0.0.1:* ws://127.0.0.1:*",
  "font-src 'self' https://fonts.gstatic.com https://res.cloudinary.com data:",
  "img-src 'self' https: data: blob:",
  "media-src 'self' https: blob:",
  "connect-src 'self' https: http://localhost:* ws://localhost:* http://127.0.0.1:* ws://127.0.0.1:*",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'self' http://localhost:* http://127.0.0.1:* https://app.mykado.store https://mykado.store https://www.mykado.store https://go.mykado.store",
].join('; ');

router.get('/:templateName', async (req, res) => {
  const { templateName } = req.params;

  res.removeHeader('X-Frame-Options');
  res.setHeader('Content-Security-Policy', CSP);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cache-Control', 'no-store');

  if (!isSafeTemplateName(templateName)) {
    return res.status(400).send('<h1>Nom invalide</h1>');
  }

  try {
    const template = await Template.findOne({ name: templateName }).lean();
    if (!template) return res.status(404).send('<h1>Template not found</h1>');

    let html;
    html = await getTemplateHtml(templateName);
    if (!html) return res.status(404).send('<h1>Not found</h1>');
    // if (templateName.startsWith('wall-of-wishes')) {
    //   // html = getReactWallShell();
    //   // if (!html) return res.status(503).send('<h1>Mur React indisponible</h1>');
    // } else {
          // html = await getTemplateHtml(templateName);
          // if (!html) return res.status(404).send('<h1>Not found</h1>');
    // }

    let demoData = DEMO_DATA[templateName];
    if (!demoData && templateName.startsWith('wall-of-wishes')) {
      demoData = DEMO_DATA['wall-of-wishes'];
    }
    demoData = demoData || {};

    /* Wall preview : adapte les demo wishes au vrai schéma attendu par
       WallApp.jsx (firstName/message/_id/color-as-index) et flag demoMode
       pour que le client hydrate wishes depuis INITIAL_DATA sans faire
       d'appel API (publicId vide). */
    if (templateName.startsWith('wall-of-wishes') && Array.isArray(demoData.wishes)) {
      demoData = {
        wallBackgroundId: demoData.bgKey || (templateName.includes('modern') ? 'bg-bokeh:nocturne' : undefined),
        ...demoData,
        templateName, // Required for WallApp to deduce isModern/isCraft
        demoMode: true,
        skipIntro: true,
        wishes: demoData.wishes.map((w, i) => ({
          _id: `demo-${w.id || i}`,
          firstName: (w.author || 'Anonyme').split(/\s+&\s+|\s+/)[0],
          role: '',
          message: w.text || '',
          color: i % 6,
          createdAt: new Date(Date.now() - (i + 1) * 3600 * 1000).toISOString(),
        })),
      };
    }
    const demoStyle = template.defaultStyle || {};
    const scale = '1';
    const fontFamily = safeFontFamily(demoStyle.fontFamily, 'Outfit');
    const primary    = safeColor(demoStyle.primaryColor, '#E11D74');
    const accent     = safeColor(demoStyle.accentColor,  '#F5B544');
    const gfontParam = GFONTS_MAP[fontFamily];
    const fontLink = gfontParam && !templateName.startsWith('wall-of-wishes')
      ? `<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${gfontParam}&display=swap">`
      : '';

    const legacyStyle = !templateName.startsWith('wall-of-wishes') ? `
    <style>
      :root {
        --primary: ${primary};
        --accent:  ${accent};
        --font:    '${fontFamily}', sans-serif;
        --fs-scale: ${scale};
      }
      body { font-family: var(--font) !important; }
    </style>` : '';

    const injection = `
    ${fontLink}
    ${legacyStyle}
    <script>
      window.__WW_DATA__  = ${safeJsonForScript(demoData)};
      window.__WW_STYLE__ = ${safeJsonForScript(demoStyle)};
      window.__WW_META__  = ${safeJsonForScript({ id: '', demo: true })};
    <\/script>`;

    html = html.replace('</head>', injection + '\n</head>');
    html = injectProtection(html);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (e) {
    console.error('[preview]', e);
    res.status(500).send('<h1>Erreur</h1>');
  }
});

module.exports = router;

