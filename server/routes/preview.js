const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const Template = require('../models/Template');
const { minify } = require('html-minifier-terser');

// Utilisation asynchrone dans ta route
async function minifyHtml(html) {
  return await minify(html, {
    collapseWhitespace: true,
    removeComments: true,
    minifyJS: true,
    minifyCSS: true,
    ignoreCustomComments: [/FB_PIXEL_ID/]
  });
}

// Demo data per template — realistic but fake
// const DEMO_DATA = {
//   birthday: {
//     greeting: 'Hiya', name: 'Lydia', greetingText: 'Tu comptes énormément pour nous !',
//     musicHint: 'C\'est mieux avec de la musique 🎶',
//     trackTitle: 'Happy Birthday', trackArtist: 'Stevie Wonder',
//     text2: 'On a cherché les mots.', text3: 'On en a trouvé beaucoup.',
//     text4: 'Mais surtout, on voulait dire', text4Adjective: 'merci',
//     text5Entry: 'Parce que,', text5Content: 'Tu es irremplaçable', smiley: '🥹',
//     bigTextPart1: 'S', bigTextPart2: 'O',
//     wishHeading: 'Joyeux Anniversaire !', wishText: 'Avec tout notre amour 💖',
//     outroText: 'Reviens nous dire si tu as aimé.', replayText: 'Clique pour revoir ↺', outroSmiley: '🥰',
//   },
//   special: {
//     greeting: 'Hiya', name: 'Kofi', greetingText: 'On a cherché et on t\'a trouvé.',
//     musicHint: 'Mets le son 🎶',
//     trackTitle: 'Gold', trackArtist: 'Spandau Ballet',
//     searchQuery: 'meilleure personne du monde',
//     result1Title: 'La personne la plus exceptionnelle recensée à ce jour',
//     result1Domain: 'google.com/featured',
//     result1Snippet: 'Après analyse de 8 milliards de profils, les experts s\'accordent sur un résultat sans appel.',
//     result1Rating: '5',
//     text2: 'On a cherché partout.', text3: 'Et on t\'a trouvé.',
//     text4: 'Parce que t\'es', text4Adjective: 'unique',
//     text5Entry: 'Et surtout,', text5Content: 'Joyeux Anniversaire !', smiley: '🎂',
//     bigTextPart1: 'W', bigTextPart2: 'O',
//     wishHeading: 'Joyeux Anniversaire !', wishText: 'Le meilleur reste à venir 🚀',
//     outroText: 'On espère que tu as aimé.', replayText: 'Revoir ↺', outroSmiley: '🎉',
//   },
//   'collective-family': {
//     greeting: 'Hiya', name: 'Ama', greetingText: 'On t\'aime tellement !',
//     musicHint: 'C\'est mieux avec de la musique 🎶',
//     trackTitle: 'Notre chanson', trackArtist: 'Artiste préféré',
//     groupName: 'La famille', groupMessage: 'On s\'est tous réunis pour te dire quelque chose d\'important…', groupEmojis: '🥰 🎂 🎊',
//     text2: 'On a cherché les mots.', text3: 'On en a trouvé beaucoup.',
//     text4: 'Mais surtout, on voulait dire', text4Adjective: 'merci',
//     text5Entry: 'Parce que,', text5Content: 'Tu es irremplaçable', smiley: '🥹',
//     bigTextPart1: 'S', bigTextPart2: 'O',
//     wishHeading: 'Joyeux Anniversaire !', wishText: 'De toute la famille avec amour 💖',
//     carouselTitle: 'Ce qu\'ils ont voulu te dire 💌',
//     outroText: 'Reviens nous dire si tu as aimé.', replayText: 'Clique pour revoir ↺', outroSmiley: '🥰',
//   },
//   'wall-of-wishes': {
//     titleName: 'Sarah',
//     subtitle:  'Partagez ce lien — chacun peut laisser son mot sur ce mur.',
//     // publicationId intentionally omitted → template falls back to SAMPLE_WISHES
//   },
//   'collective-pro': {
//     greeting: 'Cher', name: 'Alexandre', greetingText: 'Nous tenions à marquer ce moment.',
//     musicHint: 'Prenez un moment pour écouter 🎵',
//     trackTitle: 'Un morceau pour vous', trackArtist: 'Sélection de l\'équipe',
//     groupName: 'L\'équipe Marketing', groupMessage: 'Nous nous sommes réunis pour vous adresser quelques mots qui viennent du cœur.',
//     text2: 'Nous avons cherché les mots justes.', text3: 'Nous en avons trouvé beaucoup.',
//     text4: 'Mais ce qui compte vraiment, c\'est', text4Adjective: 'vous',
//     text5Entry: 'Car,', text5Content: 'Votre présence compte', smiley: '.',
//     bigTextPart1: 'M', bigTextPart2: 'R',
//     wishHeading: 'Joyeux Anniversaire', wishText: 'Avec toute notre considération',
//     carouselTitle: 'Ce que l\'équipe a voulu vous dire',
//     outroText: 'Nous espérons que ce moment vous a touché.', replayText: '↺ Revoir', outroSmiley: '✦',
//   },
// };
const DEMO_DATA = {};

// Minify HTML — strip comments, collapse whitespace
// function minifyHtml(html) {
//   return html
//     .replace(/<!--(?!FB_PIXEL_ID)[\s\S]*?-->/g, '') // Supprime les commentaires HTML
//     .replace(/\/\*[\s\S]*?\*\//g, '')               // Supprime les commentaires CSS (/* ... */)
//     .replace(/^[ \t]+/gm, '')                       // Supprime les espaces/tabulations au début de chaque ligne
//     .replace(/[ \t]+$/gm, '')                       // Supprime les espaces/tabulations à la fin de chaque ligne
//     .replace(/>\s+</g, '><')                        // Supprime l'espace entre les balises HTML
//     .replace(/[\r\n]+/g, '\n');                     // Fusionne les sauts de ligne multiples en un seul
// }
// Inject protection layer into the HTML
function injectProtection(html, templateName) {
  const watermarkCss = `
<style id="ww-demo-style">
  /* Block text selection */
  * { -webkit-user-select: none !important; user-select: none !important; }

  /* Demo watermark robuste */
  body::after {
    content: '';
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    pointer-events: none; 
    /* z-index maximal autorisé par les navigateurs pour être au-dessus de TOUT (même des modales) */
    z-index: 2147483647;
    background: 
      /* Le texte SVG répété */
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Ctext x='50%25' y='50%25' fill='rgba(0,0,0,0.07)' font-family='sans-serif' font-weight='bold' font-size='22' letter-spacing='2' text-anchor='middle' transform='rotate(-45 150 150)'%3ED%C3%89MO MYKADO%3C/text%3E%3C/svg%3E"),
      /* Tes rayures roses */
      repeating-linear-gradient(
        -45deg,
        transparent,
        transparent 60px,
        rgba(255,105,180,0.03) 60px,
        rgba(255,105,180,0.03) 120px
      );
  }
</style>`;

  const protectionScript = `
<script id="ww-demo-guard">
(function(){
  // 1. Block right-click (Fonctionne partout)
  document.addEventListener('contextmenu', e => e.preventDefault());
  
  // 2. Block shortcuts (Fonctionne partout)
  document.addEventListener('keydown', function(e) {
    var blocked = e.key === 'F12'
      || (e.ctrlKey && ['u','s','i','j','p'].includes(e.key.toLowerCase()))
      || (e.metaKey && ['u','s'].includes(e.key.toLowerCase()))
      || (e.ctrlKey && e.shiftKey && ['i','j','c'].includes(e.key.toLowerCase()));
    if (blocked) e.preventDefault();
  });

  // 3. Disable drag (Fonctionne partout)
  document.addEventListener('dragstart', e => e.preventDefault());

  // 4. Detect DevTools open (Désactivé si dans une iframe)
  // window.self !== window.top permet de savoir si on est dans une iframe
  try {
    var inIframe = window.self !== window.top;
  } catch (e) {
    var inIframe = true; // Si erreur (cross-origin), on assume que c'est une iframe
  }

  if (!inIframe) {
    var threshold = 160;
    setInterval(function() {
      if (window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold) {
        document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#aaa;font-size:1rem;">🔒 Démo indisponible</div>';
      }
    }, 1000);
  }
})();
</script>`;

  // Inject right before </head>
  html = html.replace('</head>', watermarkCss + '\n</head>');
  // Inject at end of body
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

// GET /preview/:templateName
router.get('/:templateName', async (req, res) => {
  const { templateName } = req.params;

  // Security headers — allow embedding from app origins
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self' http://localhost:3000 http://localhost:5173 https://app.mykado.store https://mykado.store");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');

  try {
    const template = await Template.findOne({ name: templateName }).lean();
    if (!template) return res.status(404).send('<h1>Template not found</h1>');

    let templatePath = path.join(__dirname, `../../templates/${templateName}/index.html`);
    if (!fs.existsSync(templatePath)) {
      templatePath = path.join(__dirname, `../templates/${templateName}/index.html`);
      if (!fs.existsSync(templatePath))
        return res.status(404).send('<h1>Not found</h1>');
    }

    let html = fs.readFileSync(templatePath, 'utf8');

    const demoData  = DEMO_DATA[templateName] || {};
    const demoStyle = template.defaultStyle || {};
    const scale = '1';
    const fontFamily = demoStyle.fontFamily || 'Outfit';
    const gfontParam = GFONTS_MAP[fontFamily];
    const fontLink = gfontParam
      ? `<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${gfontParam}&display=swap">`
      : '';

    const injection = `
    ${fontLink}
    <style>
      :root {
        --primary: ${demoStyle.primaryColor || '#E11D74'};
        --accent:  ${demoStyle.accentColor  || '#F5B544'};
        --font:    '${fontFamily}', sans-serif;
        --fs-scale: ${scale};
      }
      body { font-family: var(--font) !important; }
    </style>
    <script>
      window.__WW_DATA__  = ${JSON.stringify(demoData)};
      window.__WW_STYLE__ = ${JSON.stringify(demoStyle)};
      window.__WW_META__  = { id: '', demo: true };
    </script>`;

    html = html.replace('</head>', injection + '\n</head>');
    html = injectProtection(html, templateName);
    html = await minifyHtml(html);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (e) {
    console.error(e);
    res.status(500).send('<h1>Erreur</h1>');
  }
});

module.exports = router;