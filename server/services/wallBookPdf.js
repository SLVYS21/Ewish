/* ================================================================
   myKado — Wall Book PDF generator
   Génère un "livre des mots" A5 portrait à partir d'un mur.
     1  page de couverture (destinataire + événement)
     2  page de préface (nombre de mots, sous-titre)
     3  N pages : un mot par page (post-it façon mur)
     4  page finale (signature myKado)
   Rendu via Puppeteer — HTML/CSS puis print-to-PDF.
   ---------------------------------------------------------------
   Points sensibles :
     - Puppeteer + Chromium pèsent lourd. On garde une instance
       chrome partagée via getBrowser() pour éviter le cold start.
     - Les couleurs pastel viennent du mur classique (index.html:412).
       Si on ajoute une variante moderne du livre, on switchera ici.
     - Les photos Cloudinary passent en thumbnail (`c_fill,g_face,w_900`)
       pour éviter d'embarquer des originaux 4K dans le PDF.
   ================================================================ */

let _browserPromise = null;
async function getBrowser() {
  if (_browserPromise) return _browserPromise;
  const puppeteer = require('puppeteer');
  /* Prod déploiement (Coolify/Nixpacks/Docker) : si Chrome n'a pas été
     téléchargé par le postinstall, on autorise un chemin système via
     PUPPETEER_EXECUTABLE_PATH (ex: /usr/bin/google-chrome-stable). */
  const launchOptions = {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  };
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  _browserPromise = puppeteer.launch(launchOptions).catch(err => {
    _browserPromise = null;
    throw err;
  });
  return _browserPromise;
}

/* Palette post-it du mur classique — synchronisée avec index.html:412-418. */
const STICKY_BG = ['#FFF7B8', '#C6F0C2', '#BFE3FF', '#FFD3C2', '#E7D5F0', '#F6E3C8', '#F9F5EA'];

/* Fonds animés partagés avec le rendu web (server/utils/animatedBgs.js).
   Puppeteer capture chaque page au 1er frame — les animations CSS ne
   jouent pas mais l'état initial (positions/gradients) donne le motif. */
const { getBgHtml, pickBgSequence } = require('../utils/animatedBgs');

/* Adapte le HTML factory pour l'embed dans une page A5 : position fixed
   → absolute (sinon debord entre pages), z-index reset à 0 (au-dessus
   du page bg, sous le sticky note). */
function bgHtmlForPage(key) {
  const raw = getBgHtml(key);
  if (!raw) return '';
  return raw
    .replace(/position:\s*fixed;/g, 'position: absolute;')
    .replace(/z-index:\s*-1;/g, 'z-index: 0;');
}

/* Fallback gradient/color pour chaque type de bg animé — miroir de
   server/routes/serve.js:206-215. Le mur utilise toujours la première
   variante ("nocturne", "sunlit"…), on reproduit la même palette ici. */
const WALL_BG_FALLBACK = {
  'bg-blob':      'linear-gradient(155deg,#243157 0%,#1A234A 45%,#141B3B 100%)',
  'bg-polka':     'linear-gradient(160deg,#F0B24C,#E4922B)',
  'bg-bokeh':     'radial-gradient(120% 90% at 50% 15%,#3A2450 0%,#241634 55%,#160D22 100%)',
  'bg-comic':     '#F2D24C',
  'bg-synthwave': 'linear-gradient(180deg,#1A1140 0%,#2A1550 46%,#3E1C5E 58%,#160D22 100%)',
  'bg-sunburst':  '#1B2450',
};

/* Résout la CSS de fond du mur pour la cover + l'outro du livre PDF.
   Retourne un fond utilisable en CSS (image, gradient, couleur) + l'ink
   à appliquer aux textes pour rester lisible. */
function resolveWallBg(style) {
  const s = style || {};
  const rawBg = String(s.wallBackground || '').trim();
  const bgId  = String(s.wallBackgroundId || '').trim();
  const rawInk = String(s.wallBackgroundInk || '').trim();
  const ink = /^#[0-9a-f]{3,8}$/i.test(rawInk) ? rawInk : '#FFFFFF';

  /* Whitelist stricte anti-injection CSS — miroir de serve.js:199. */
  const unsafe = /[;<>}\n\r]/;

  /* wallBackground: 'transparent' → bg animé, mappé sur le gradient
     fallback correspondant à wallBackgroundId. */
  if (rawBg === 'transparent' && WALL_BG_FALLBACK[bgId]) {
    return { css: WALL_BG_FALLBACK[bgId], ink };
  }
  /* Image de fond (url("...")) — s'affiche via background-image + cover. */
  if (/^url\(/i.test(rawBg) && !unsafe.test(rawBg)) {
    return { css: `${rawBg} center/cover no-repeat`, ink, isImage: true };
  }
  /* Gradient direct ou couleur hex. */
  if (!unsafe.test(rawBg) && (/^(?:linear|radial|conic)-gradient/i.test(rawBg) || /^#[0-9a-f]{3,8}$/i.test(rawBg))) {
    return { css: rawBg, ink };
  }
  /* Fallback bgId sans wallBackground (compat). */
  if (WALL_BG_FALLBACK[bgId]) {
    return { css: WALL_BG_FALLBACK[bgId], ink };
  }
  return { css: '', ink: '' };
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function cldThumb(url, tx) {
  if (!url || typeof url !== 'string') return url;
  if (url.indexOf('/upload/') === -1) return url;
  return url.replace('/upload/', `/upload/${tx}/`);
}

function formatFrenchDate(d) {
  try {
    return new Date(d).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch { return ''; }
}

/* ---------- HTML builder ---------- */
function buildBookHtml({ publication, wishes, baseUrl }) {
  const d = publication.data || {};
  /* recipient = prénom seul du destinataire (Sarah). Utilisé pour :
     - signature du mot de merci ("— Sarah")
     - titre <title> HTML ("Livre des mots — Sarah")
     Fallback legacy sur titleName/title pour les murs pré-migration. */
  const recipient = d.recipient || d.titleName || publication.title || 'Toi';
  /* Titre affiché sur la cover : on utilise publication.title tel quel
     (déjà formaté par occasion : "Joyeux anniversaire, Marie", "Le mariage
     de …") sans jamais préfixer par "Pour" — la copy du mur suffit. */
  const displayTitle = publication.title || d.titleName || 'Livre des mots';
  const subtitle  = d.subtitle || 'Un mur de mots rassemblés avec amour.';
  const eventName = d.event || d.eventName || d.occasion || '';
  const generatedAt = formatFrenchDate(new Date());
  const wishCount = wishes.length;
  const wallBg = resolveWallBg(publication.style);
  const hasWallBg = !!wallBg.css;
  /* Ink dérivé du fond : sur bg image/gradient sombre, on force du blanc
     pour rester lisible. Sinon on utilise l'ink officiel du mur. */
  const coverInk = wallBg.ink || '#1E2952';
  const coverInkSoft = wallBg.ink ? 'rgba(255,255,255,0.78)' : '#4a4f66';

  const cover = `
    <section class="page cover${hasWallBg ? ' has-wall-bg' : ''}">
      ${hasWallBg ? '<div class="cover-veil"></div>' : ''}
      <div class="cover-frame">
        <div class="cover-kicker">Livre des mots</div>
        <h1 class="cover-title">${escapeHtml(displayTitle)}</h1>
        ${eventName ? `<div class="cover-event">${escapeHtml(eventName)}</div>` : ''}
        <div class="cover-sub">${escapeHtml(subtitle)}</div>
        <div class="cover-count">${wishCount} mot${wishCount > 1 ? 's' : ''} reçu${wishCount > 1 ? 's' : ''}</div>
        <div class="cover-date">${escapeHtml(generatedAt)}</div>
      </div>
    </section>
  `;

  const preface = `
    <section class="page preface">
      <div class="preface-inner">
        <div class="preface-mark">«</div>
        <p>Voici tous les mots que tes proches ont laissés sur ton mur.</p>
        <p>Chaque page est un souvenir. Prends ton temps.</p>
        <div class="preface-mark end">»</div>
      </div>
    </section>
  `;

  /* Séquence de fonds palette (une par page, jamais deux adjacents
     identiques) — mêmes 30 variantes que les statuts en live. */
  const bgSequence = pickBgSequence(wishes.length);

  const wishPages = wishes.map((w, i) => {
    const bg = STICKY_BG[(w.color ?? 0) % STICKY_BG.length];
    const rot = (typeof w.rot === 'number' ? w.rot : 0);
    const clampedRot = Math.max(-4, Math.min(4, rot));
    /* GIFs et photos vivent tous les deux dans w.photoUrl — la seule
       distinction est w.mediaType. Sans inclure 'gif' ici, on perdait
       silencieusement toutes les cartes avec GIF dans le PDF. */
    const hasImage = (w.mediaType === 'photo' || w.mediaType === 'gif') && w.photoUrl;
    /* Pour les vidéos, Cloudinary sait extraire une frame en .jpg via la
       delivery type "video" — on affiche une vignette (poster) dans le
       livre puisqu'un PDF ne joue pas la vidéo. */
    const hasVideoPoster = w.mediaType === 'video' && w.videoUrl;
    let photoTag = '';
    if (hasImage) {
      /* f_auto → Cloudinary sert le meilleur format pour Chrome (WebP/JPG).
         Pour un GIF animé, seule la 1re frame apparaîtra dans le PDF,
         c'est le comportement attendu (un PDF est statique). */
      const src = cldThumb(w.photoUrl, 'c_fill,g_auto,w_900,h_680,q_auto,f_auto');
      photoTag = `<div class="wish-photo"><img src="${escapeHtml(src)}" alt="" crossorigin="anonymous"></div>`;
    } else if (hasVideoPoster) {
      /* Extraction d'une frame de la vidéo Cloudinary : on remplace
         /video/upload/ par /video/upload/so_0,f_jpg,... et on force
         l'extension .jpg pour obtenir une image statique. */
      let poster = w.videoUrl;
      if (poster.indexOf('/video/upload/') !== -1) {
        poster = poster
          .replace('/video/upload/', '/video/upload/so_0,f_jpg,c_fill,g_auto,w_900,h_680,q_auto/')
          .replace(/\.(mp4|webm|mov|avi|mkv)(\?.*)?$/i, '.jpg$2');
      }
      photoTag = `<div class="wish-photo"><img src="${escapeHtml(poster)}" alt="" crossorigin="anonymous"></div>`;
    }
    const pageBg = bgHtmlForPage(bgSequence[i]);
    return `
      <section class="page wish-page">
        ${pageBg}
        <div class="wish-note" style="background:${bg};">
          ${photoTag}
          <div class="wish-body">
            <p class="wish-text">${escapeHtml(w.message)}</p>
            <div class="wish-signature">
              <span class="wish-name">${escapeHtml(w.firstName || 'Anonyme')}</span>
              ${w.role ? `<span class="wish-role">${escapeHtml(w.role)}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="page-num">${i + 1} / ${wishCount}</div>
      </section>
    `;
  }).join('');

  /* Mot de merci du destinataire — étape 7 du flow murs.
     Injecté juste avant l'outro, seulement s'il est non-vide. */
  const thankYouPage = publication.thankYouMessage?.trim()
    ? `
      <section class="page thankyou">
        <div class="thankyou-inner">
          <div class="thankyou-kicker">Un mot pour vous tous</div>
          <p class="thankyou-body">${escapeHtml(publication.thankYouMessage.trim())}</p>
          <div class="thankyou-sig">— ${escapeHtml(recipient)}</div>
        </div>
      </section>
    `
    : '';

  const outro = `
    <section class="page outro${hasWallBg ? ' has-wall-bg' : ''}">
      ${hasWallBg ? '<div class="outro-veil"></div>' : ''}
      <div class="outro-inner">
        <div class="outro-mark">myKado</div>
        <div class="outro-tag">Généré le ${escapeHtml(generatedAt)}</div>
      </div>
    </section>
  `;

  const baseTag = baseUrl ? `<base href="${escapeHtml(baseUrl)}/">` : '';
  const wallBgCss = hasWallBg
    ? `.cover.has-wall-bg, .outro.has-wall-bg { background: ${wallBg.css}; }`
    : '';

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
${baseTag}
<title>Livre des mots — ${escapeHtml(recipient)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Caveat:wght@400;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root {
    --ink:      #1E2952;
    --ink-2:    #4a4f66;
    --muted:    #7D7156;
    --paper:    #F9F5EA;
    --gold:     #E8A33D;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: var(--paper); color: var(--ink); font-family: 'Fraunces', Georgia, 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif; }
  @page { size: A5 portrait; margin: 0; }
  .page {
    width: 148mm;
    height: 210mm;
    page-break-after: always;
    position: relative;
    overflow: hidden;
    background: var(--paper);
    padding: 22mm 20mm;
  }
  .page:last-child { page-break-after: auto; }

  /* ── COVER ── */
  .cover {
    background: linear-gradient(160deg, #FBE7A2 0%, #F6CFC3 55%, #E7D5F0 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 22mm 18mm;
    position: relative;
    color: var(--ink);
  }
  /* Cover avec fond du mur : on tinte le voile blanc plus léger et on
     bascule les couleurs sur l'ink du mur (souvent blanc pour bgs sombres). */
  .cover.has-wall-bg {
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    color: ${escapeHtml(coverInk)};
  }
  .cover-veil {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.32) 100%);
    pointer-events: none;
  }
  .cover-frame {
    border: 2px solid currentColor;
    padding: 18mm 12mm;
    text-align: center;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 6mm;
    background: rgba(255,255,255,0.35);
    position: relative;
    z-index: 1;
  }
  .cover.has-wall-bg .cover-frame {
    background: rgba(0,0,0,0.28);
    border-color: rgba(255,255,255,0.55);
  }
  .cover-kicker {
    font-family: 'Inter', sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.24em;
    font-size: 10pt;
    color: var(--ink-2);
  }
  .cover.has-wall-bg .cover-kicker { color: ${escapeHtml(coverInkSoft)}; }
  .cover-title {
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 700;
    font-size: 38pt;
    line-height: 1.05;
    color: var(--ink);
    overflow-wrap: anywhere;
    word-break: break-word;
  }
  .cover.has-wall-bg .cover-title { color: ${escapeHtml(coverInk)}; }
  .cover-event {
    font-family: 'Caveat', cursive;
    font-size: 28pt;
    color: var(--gold);
  }
  .cover-sub {
    font-family: 'Inter', sans-serif;
    font-size: 11pt;
    color: var(--ink-2);
    line-height: 1.5;
    max-width: 82mm;
    margin: 0 auto;
  }
  .cover.has-wall-bg .cover-sub { color: ${escapeHtml(coverInkSoft)}; }
  .cover-count {
    margin-top: auto;
    font-family: 'Inter', sans-serif;
    font-size: 10pt;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--ink-2);
  }
  .cover.has-wall-bg .cover-count { color: ${escapeHtml(coverInkSoft)}; }
  .cover-date {
    font-family: 'Inter', sans-serif;
    font-size: 9pt;
    color: var(--muted);
  }
  .cover.has-wall-bg .cover-date { color: ${escapeHtml(coverInkSoft)}; }

  /* ── PREFACE ── */
  .preface { display: flex; align-items: center; justify-content: center; }
  .preface-inner {
    max-width: 100mm;
    text-align: center;
    font-family: 'Fraunces', Georgia, serif;
    font-size: 15pt;
    line-height: 1.6;
    color: var(--ink);
  }
  .preface-inner p + p { margin-top: 6mm; }
  .preface-mark {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 64pt;
    color: var(--gold);
    line-height: 0.6;
    margin-bottom: 6mm;
  }
  .preface-mark.end { margin: 6mm 0 0; }

  /* ── WISH PAGES ── */
  .wish-page {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 15mm;
    /* position: relative + overflow: hidden → contient le motif de fond
       (bg-blob / sunburst / etc. injecté en absolute derrière la note). */
    position: relative;
    overflow: hidden;
  }
  /* Le motif de fond palette est le premier enfant (.ab-container) —
     absolute au fond, la note sticky s'affiche au-dessus. */
  .wish-page > .ab-container { z-index: 0; }
  .wish-note {
    /* z-index: 1 → au-dessus du motif de fond */
    position: relative;
    z-index: 1;
    width: 108mm;
    max-height: 170mm;
    padding: 12mm 12mm 10mm;
    border-radius: 4mm;
    box-shadow:
      0 4mm 10mm rgba(0,0,0,0.20),
      0 10mm 22mm rgba(0,0,0,0.12);
    display: flex;
    flex-direction: column;
    gap: 6mm;
  }
  .wish-photo {
    width: 100%;
    height: 55mm;
    overflow: hidden;
    border-radius: 2mm;
    background: rgba(0,0,0,0.05);
  }
  .wish-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .wish-body { display: flex; flex-direction: column; gap: 6mm; flex: 1; }
  .wish-text {
    font-family: 'Caveat', cursive, 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji';
    font-size: 16pt;
    line-height: 1.45;
    color: #2a2540;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: anywhere;
    word-break: break-word;
    hyphens: auto;
  }
  .wish-signature {
    margin-top: auto;
    display: flex;
    justify-content: flex-end;
    align-items: baseline;
    gap: 3mm;
  }
  .wish-name {
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 700;
    font-size: 14pt;
    color: var(--ink);
  }
  .wish-role {
    font-family: 'Inter', sans-serif;
    font-size: 9pt;
    color: var(--ink-2);
    font-style: italic;
  }
  .page-num {
    position: absolute;
    bottom: 8mm;
    left: 0;
    right: 0;
    text-align: center;
    font-family: 'Inter', sans-serif;
    font-size: 8pt;
    letter-spacing: 0.14em;
    color: var(--muted);
  }

  /* ── THANK YOU PAGE (destinataire) ── */
  .thankyou {
    background: linear-gradient(160deg, #FFF5F7 0%, #FBE7A2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 22mm 20mm;
  }
  .thankyou-inner {
    max-width: 108mm;
    text-align: center;
  }
  .thankyou-kicker {
    font-family: 'Inter', sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.24em;
    font-size: 10pt;
    color: var(--gold);
    margin-bottom: 10mm;
  }
  .thankyou-body {
    font-family: 'Caveat', cursive;
    font-size: 26pt;
    line-height: 1.4;
    color: var(--ink);
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: anywhere;
    word-break: break-word;
    hyphens: auto;
  }
  .thankyou-sig {
    margin-top: 12mm;
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 700;
    font-size: 16pt;
    color: var(--ink);
    font-style: italic;
  }

  /* ── OUTRO ── */
  .outro {
    background: var(--ink);
    color: #EBE3CE;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .outro.has-wall-bg {
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
  }
  .outro-veil {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.55) 100%);
    pointer-events: none;
  }
  .outro-inner { text-align: center; position: relative; z-index: 1; }
  .outro-mark {
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 700;
    font-size: 32pt;
    letter-spacing: 0.02em;
    color: var(--gold);
  }
  .outro-tag {
    margin-top: 4mm;
    font-family: 'Inter', sans-serif;
    font-size: 9pt;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #EBE3CE;
  }
  ${wallBgCss}
</style>
</head>
<body>
${cover}
${preface}
${wishPages}
${thankYouPage}
${outro}
</body>
</html>`;
}

/* ---------- Public API ---------- */
async function renderWallBookPdf({ publication, wishes, baseUrl }) {
  const html = buildBookHtml({ publication, wishes, baseUrl });
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    /* Timeout Puppeteer par défaut = 30s. Sur des murs avec beaucoup
       de photos Cloudinary, networkidle0 peut prendre plus longtemps.
       On monte à 60s pour éviter les timeouts sur les gros livres. */
    page.setDefaultTimeout(60_000);
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60_000 });
    await page.evaluateHandle('document.fonts.ready');
    /* Attend explicitement que chaque <img> soit chargée ET décodée —
       networkidle0 seul ne garantit pas ça (une image reçue en réponse
       peut encore être en cours de décodage au moment du print). */
    await page.evaluate(async () => {
      const imgs = Array.from(document.images || []);
      await Promise.all(imgs.map(img => {
        if (img.complete && img.naturalWidth > 0) return img.decode().catch(() => {});
        return new Promise(resolve => {
          const done = () => resolve();
          img.addEventListener('load', done, { once: true });
          img.addEventListener('error', done, { once: true });
          /* Filet de sécu : ne bloque pas le rendu à cause d'une image morte. */
          setTimeout(done, 8000);
        }).then(() => img.decode().catch(() => {}));
      }));
    });
    /* Petit délai post-décodage pour laisser les fonds animés se poser. */
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 800)));
    const pdf = await page.pdf({
      format: 'A5',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    return pdf;
  } finally {
    await page.close();
  }
}

module.exports = { renderWallBookPdf, buildBookHtml };
