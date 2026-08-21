/* ================================================================
   myKado — Wall Book PDF (react-pdf/renderer, côté client)
   ---------------------------------------------------------------
   Alternative légère à Puppeteer serveur : le PDF est généré dans
   le navigateur de l'utilisateur, puis téléchargé directement.

   Miroir de server/services/wallBookPdf.js — quand tu modifies la
   mise en page, pense à synchroniser les deux (le HTML/Puppeteer
   reste en fallback caché).

   Limitations vs. version Puppeteer :
   - Pas de column-count → mosaïque calculée en JS (2 colonnes)
   - Fonds animés CSS (bg-blob, synthwave…) → aplatis en couleur
     dominante (WALL_BG_FALLBACK) car react-pdf n'exécute pas de CSS
   - Pas de `hyphens: auto` → wrap naturel uniquement
   ================================================================ */

import {
  Document, Page, Text, View, Image, Font, StyleSheet,
} from '@react-pdf/renderer';

/* ─── Fonts ─── */
/* On fetch les WOFF2 depuis Google Fonts. react-pdf ne supporte pas
   les variable fonts avec `opsz`, on donne des URLs figées par poids. */
Font.register({
  family: 'Fraunces',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/fraunces/v38/6NUh8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7hzFUPJH58nib1603gg7S2nfgRYIctxuTCf7Wp0hGNw.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/fraunces/v38/6NUh8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7hzFUPJH58nib1603gg7S2nfgRYIcUByTCf7Wp0hGNw.ttf', fontWeight: 700 },
  ],
});
Font.register({
  family: 'Caveat',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/caveat/v23/WnznHAc5bAfYB2QRah7pcpNvOx-pjfJ9eIWpZD5Mmgo.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/caveat/v23/WnznHAc5bAfYB2QRah7pcpNvOx-pjSx6eIWpZD5Mmgo.ttf', fontWeight: 600 },
  ],
});
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hjZ-Ck-8.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYAZ9hjZ-Ck-8.ttf', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hjZ-Ck-8.ttf', fontWeight: 700 },
  ],
});
Font.registerEmojiSource({
  format: 'png',
  url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/',
});
/* Désactive hyphénation (pas de dictionnaire fr embarqué). */
Font.registerHyphenationCallback(word => [word]);

/* ─── Palette (miroir server/services/wallBookPdf.js:41) ─── */
const STICKY_BG = ['#FFF7B8', '#C6F0C2', '#BFE3FF', '#FFD3C2', '#E7D5F0', '#F6E3C8', '#F9F5EA'];

/* ─── Fallback fonds animés (miroir server/services/wallBookPdf.js:62) ─── */
const WALL_BG_FALLBACK_SOLID = {
  'bg-blob':      '#1A234A',
  'bg-polka':     '#E4922B',
  'bg-bokeh':     '#241634',
  'bg-comic':     '#F2D24C',
  'bg-synthwave': '#2A1550',
  'bg-sunburst':  '#1B2450',
};

/* Résout la couleur de fond wall pour la cover/outro. react-pdf ne
   supporte pas les gradients CSS → on prend une couleur dominante. */
function resolveWallBg(style) {
  const s = style || {};
  const rawBg = String(s.wallBackground || '').trim();
  const bgId  = String(s.wallBackgroundId || '').trim();
  const rawInk = String(s.wallBackgroundInk || '').trim();
  const ink = /^#[0-9a-f]{3,8}$/i.test(rawInk) ? rawInk : '#FFFFFF';
  if (rawBg === 'transparent' && WALL_BG_FALLBACK_SOLID[bgId]) {
    return { color: WALL_BG_FALLBACK_SOLID[bgId], ink };
  }
  /* Image de fond : url("...") */
  const urlMatch = rawBg.match(/^url\(["']?(.+?)["']?\)$/i);
  if (urlMatch) return { image: urlMatch[1], ink };
  /* Couleur hex directe */
  if (/^#[0-9a-f]{3,8}$/i.test(rawBg)) return { color: rawBg, ink };
  /* Fallback bgId */
  if (WALL_BG_FALLBACK_SOLID[bgId]) return { color: WALL_BG_FALLBACK_SOLID[bgId], ink };
  return {};
}

function cldThumb(url, tx) {
  if (!url || typeof url !== 'string') return url;
  if (url.indexOf('/upload/') === -1) return url;
  return url.replace('/upload/', `/upload/${tx}/`);
}
function videoPoster(url) {
  if (!url || url.indexOf('/video/upload/') === -1) return null;
  return url
    .replace('/video/upload/', '/video/upload/so_0,f_jpg,c_fill,g_auto,w_900,h_680,q_auto/')
    .replace(/\.(mp4|webm|mov|avi|mkv)(\?.*)?$/i, '.jpg$2');
}
function formatFrenchDate(d) {
  try {
    return new Date(d).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch { return ''; }
}

/* ─── Styles ─── */
const s = StyleSheet.create({
  /* Cover — A5 */
  coverPage: {
    padding: '22mm 18mm',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'Fraunces',
  },
  coverFrame: {
    borderWidth: 2,
    borderStyle: 'solid',
    padding: '18mm 12mm',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  coverKicker: {
    fontFamily: 'Inter',
    fontSize: 8,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  },
  coverTitle: {
    fontFamily: 'Fraunces',
    fontWeight: 700,
    fontSize: 28,
    textAlign: 'center',
    lineHeight: 1.1,
  },
  coverEvent: {
    fontFamily: 'Caveat',
    fontSize: 22,
    color: '#E8A33D',
    textAlign: 'center',
  },
  coverSub: {
    fontFamily: 'Inter',
    fontSize: 9,
    textAlign: 'center',
    lineHeight: 1.5,
    maxWidth: 220,
  },
  coverCount: {
    fontFamily: 'Inter',
    fontSize: 8,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginTop: 24,
  },
  coverDate: {
    fontFamily: 'Inter',
    fontSize: 7,
    color: '#7D7156',
  },

  /* Preface */
  prefacePage: {
    padding: '22mm 20mm',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F5EA',
  },
  prefaceInner: { maxWidth: 260, alignItems: 'center' },
  prefaceMark: {
    fontFamily: 'Fraunces',
    fontSize: 48,
    color: '#E8A33D',
    lineHeight: 0.8,
    marginBottom: 12,
  },
  prefaceText: {
    fontFamily: 'Fraunces',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 1.6,
    color: '#1E2952',
    marginBottom: 10,
  },

  /* Wish page — A5, 1 mot/page (book) */
  wishPage: {
    padding: '15mm',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F5EA',
    position: 'relative',
  },
  wishNote: {
    width: '85%',
    padding: '10mm 10mm 8mm',
    borderRadius: 8,
    /* react-pdf shadow via elevated-style border trick — les box-shadow
       ne sont pas rendus, on donne un léger relief via padding + bg. */
  },
  wishPhoto: {
    width: '100%',
    height: 130,
    marginBottom: 12,
    borderRadius: 4,
    objectFit: 'cover',
  },
  wishSticker: {
    width: '100%',
    height: 130,
    marginBottom: 12,
    objectFit: 'contain',
  },
  wishText: {
    fontFamily: 'Caveat',
    fontSize: 14,
    lineHeight: 1.45,
    color: '#2a2540',
  },
  wishSignature: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'baseline',
    gap: 6,
  },
  wishName: {
    fontFamily: 'Fraunces',
    fontWeight: 700,
    fontSize: 11,
    color: '#1E2952',
  },
  wishRole: {
    fontFamily: 'Inter',
    fontSize: 7,
    color: '#4a4f66',
    fontStyle: 'italic',
  },
  pageNum: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 6,
    color: '#7D7156',
    letterSpacing: 1.4,
  },

  /* Mosaïque — A4, 2 colonnes */
  mosaicPage: {
    padding: '20mm 15mm',
    backgroundColor: '#F9F5EA',
  },
  mosaicColumns: {
    flexDirection: 'row',
    gap: 15,
  },
  mosaicColumn: {
    flex: 1,
    gap: 15,
  },
  mosaicNote: {
    padding: '10mm 10mm 8mm',
    borderRadius: 8,
  },

  /* Poster — A3 Paysage */
  posterPage: {
    padding: '20mm',
    backgroundColor: '#FFFFFF', // Fond blanc pur type affiche
    flexDirection: 'row',
  },
  posterColumnSide: {
    flex: 1,
    paddingHorizontal: 15,
    justifyContent: 'space-evenly',
  },
  posterColumnCenter: {
    flex: 1.5,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  posterCenterpiece: {
    alignItems: 'center',
    marginVertical: 40,
  },
  posterWish: {
    alignItems: 'center',
    marginBottom: 20,
  },

  /* Thank you */
  thankyouPage: {
    padding: '22mm 20mm',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5F7',
  },
  thankyouInner: { maxWidth: 260, alignItems: 'center' },
  thankyouKicker: {
    fontFamily: 'Inter',
    fontSize: 8,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: '#E8A33D',
    marginBottom: 20,
  },
  thankyouBody: {
    fontFamily: 'Caveat',
    fontSize: 20,
    lineHeight: 1.4,
    textAlign: 'center',
    color: '#1E2952',
  },
  thankyouSig: {
    marginTop: 20,
    fontFamily: 'Fraunces',
    fontWeight: 700,
    fontSize: 14,
    color: '#1E2952',
    fontStyle: 'italic',
  },

  /* Outro */
  outroPage: {
    padding: '22mm 18mm',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E2952',
  },
  outroMark: {
    fontFamily: 'Fraunces',
    fontWeight: 700,
    fontSize: 26,
    color: '#E8A33D',
  },
  outroTag: {
    marginTop: 4,
    fontFamily: 'Inter',
    fontSize: 7,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: '#EBE3CE',
  },
});

/* ─── Sous-composants ─── */
function WishPhoto({ w }) {
  const hasImage = (w.mediaType === 'photo' || w.mediaType === 'gif') && w.photoUrl;
  const hasSticker = w.mediaType === 'sticker' && w.photoUrl;
  const hasVideo = w.mediaType === 'video' && w.videoUrl;
  if (hasSticker) {
    // Force f_png pour les stickers (évite les WebP/SVG non gérés)
    return <Image src={cldThumb(w.photoUrl, 'w_300,f_png')} style={s.wishSticker} />;
  }
  if (hasImage) {
    // Force f_jpg because react-pdf does not support WebP/AVIF well.
    return <Image src={cldThumb(w.photoUrl, 'c_fill,g_auto,w_900,h_680,q_auto,f_jpg')} style={s.wishPhoto} />;
  }
  if (hasVideo) {
    const p = videoPoster(w.videoUrl);
    return p ? <Image src={p} style={s.wishPhoto} /> : null;
  }
  return null;
}

function WishNote({ w, style }) {
  const bg = STICKY_BG[(w.color ?? 0) % STICKY_BG.length];
  return (
    <View style={[style, { backgroundColor: bg }]}>
      <WishPhoto w={w} />
      <Text style={s.wishText}>{w.message || ''}</Text>
      <View style={s.wishSignature}>
        <Text style={s.wishName}>{w.firstName || 'Anonyme'}</Text>
        {w.role ? <Text style={s.wishRole}>{w.role}</Text> : null}
      </View>
    </View>
  );
}

const PEN_COLORS = ['#1E2952', '#000000', '#631321', '#113A23', '#2a2540', '#3b2512'];
const ROTATIONS = [-2, 1.5, 3, -1, -3, 2, -1.5, 2.5];

function PosterWishNote({ w, index }) {
  const color = PEN_COLORS[index % PEN_COLORS.length];
  const rot = ROTATIONS[index % ROTATIONS.length];
  
  return (
    <View style={[s.posterWish, { transform: `rotate(${rot}deg)` }]}>
      {(w.photoUrl || w.videoUrl) ? (
         <View style={{ width: 90, height: 90, marginBottom: 8, borderRadius: 4, overflow: 'hidden' }}>
            <WishPhoto w={w} />
         </View>
      ) : null}
      <Text style={{ fontFamily: 'Caveat', fontSize: 18, color, textAlign: 'center', lineHeight: 1.3 }}>
        {w.message}
      </Text>
      <Text style={{ fontFamily: 'Caveat', fontSize: 14, color, marginTop: 6, textAlign: 'center' }}>
        — {w.firstName || 'Anonyme'}
      </Text>
    </View>
  );
}

function splitPoster(wishes) {
  const chunks = [];
  const WISHES_PER_PAGE = 12; // 4 left, 4 right, 2 top-center, 2 bottom-center
  for (let i = 0; i < wishes.length; i += WISHES_PER_PAGE) {
    const pageWishes = wishes.slice(i, i + WISHES_PER_PAGE);
    const left = [], right = [], centerTop = [], centerBottom = [];
    pageWishes.forEach((w, idx) => {
      if (idx % 4 === 0) left.push(w);
      else if (idx % 4 === 1) right.push(w);
      else if (idx % 4 === 2) {
        if (centerTop.length < 2) centerTop.push(w);
        else left.push(w);
      } else {
        if (centerBottom.length < 2) centerBottom.push(w);
        else right.push(w);
      }
    });
    chunks.push({ left, right, centerTop, centerBottom });
  }
  return chunks;
}

/* Répartit N wishes en 2 colonnes pour la mosaïque (round-robin). */
function splitMosaic(wishes) {
  const cols = [[], []];
  wishes.forEach((w, i) => cols[i % 2].push(w));
  return cols;
}

/* ─── Document principal ─── */
export default function WallBookPdfDoc({ publication, wishes, layout = 'book', bgMode = 'wall' }) {
  const d = publication?.data || {};
  const recipient = d.recipient || d.titleName || publication?.title || 'Toi';
  const displayTitle = publication?.title || d.titleName || 'Livre des mots';
  const subtitle = d.subtitle || 'Un mur de mots rassemblés avec amour.';
  const eventName = d.event || d.eventName || d.occasion || '';
  const generatedAt = formatFrenchDate(new Date());
  const wishCount = wishes.length;
  const isMosaic = layout === 'mosaic';
  const isPoster = layout === 'poster';
  const isClean = bgMode === 'clean';
  const wallBg = isClean ? {} : resolveWallBg(publication?.style);

  let pageSize = 'A5';
  if (isMosaic) pageSize = 'A4';
  if (isPoster) pageSize = 'A3';

  /* Cover : fond du mur si dispo, sinon gradient pastel figé en couleur unie. */
  const coverBg = wallBg.image
    ? undefined
    : (wallBg.color || '#FBE7A2');
  const coverInk = wallBg.color ? (wallBg.ink || '#FFFFFF') : '#1E2952';

  return (
    <Document title={`Livre des mots — ${recipient}`} author="myKado">
      {/* Cover (affichée uniquement si ce n'est pas un Poster qui a déjà un titre massif) */}
      {!isPoster && (
        <Page size={pageSize} style={[s.coverPage, { backgroundColor: coverBg, color: coverInk }]}>
          {wallBg.image ? (
            <Image src={wallBg.image} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }} />
          ) : null}
          {wallBg.image || wallBg.color ? (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.25)' }} />
          ) : null}
          <View style={[s.coverFrame, { borderColor: coverInk, backgroundColor: wallBg.color || wallBg.image ? 'rgba(0,0,0,0.28)' : 'rgba(255,255,255,0.35)' }]}>
            <Text style={[s.coverKicker, { color: coverInk }]}>Livre des mots</Text>
            <Text style={[s.coverTitle, { color: coverInk }]}>{displayTitle}</Text>
            {eventName ? <Text style={s.coverEvent}>{eventName}</Text> : null}
            <Text style={[s.coverSub, { color: coverInk }]}>{subtitle}</Text>
            <Text style={[s.coverCount, { color: coverInk }]}>{wishCount} mot{wishCount > 1 ? 's' : ''} reçu{wishCount > 1 ? 's' : ''}</Text>
            <Text style={[s.coverDate, { color: coverInk }]}>{generatedAt}</Text>
          </View>
        </Page>
      )}

      {/* Preface */}
      {!isPoster && (
        <Page size={pageSize} style={s.prefacePage}>
          <View style={s.prefaceInner}>
            <Text style={s.prefaceMark}>«</Text>
            <Text style={s.prefaceText}>Voici tous les mots que tes proches ont laissés sur ton mur.</Text>
            <Text style={s.prefaceText}>Chaque page est un souvenir. Prends ton temps.</Text>
            <Text style={s.prefaceMark}>»</Text>
          </View>
        </Page>
      )}

      {/* Wish pages */}
      {isPoster ? (
        splitPoster(wishes).map((chunk, pageIndex) => (
          <Page key={`poster-${pageIndex}`} size="A3" orientation="landscape" style={s.posterPage}>
            {/* Colonne Gauche */}
            <View style={s.posterColumnSide}>
              {chunk.left.map((w, i) => <PosterWishNote key={w._id} w={w} index={i} />)}
            </View>

            {/* Colonne Centrale */}
            <View style={s.posterColumnCenter}>
              <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 20 }}>
                {chunk.centerTop.map((w, i) => <PosterWishNote key={w._id} w={w} index={i + 10} />)}
              </View>

              <View style={s.posterCenterpiece}>
                <Text style={[s.coverKicker, { color: '#7D7156', marginBottom: 12 }]}>Livre des mots</Text>
                <Text style={{ fontFamily: 'Fraunces', fontSize: 42, color: '#1E2952', textAlign: 'center', lineHeight: 1.1 }}>
                  {displayTitle}
                </Text>
                {eventName ? (
                  <Text style={{ fontFamily: 'Caveat', fontSize: 32, color: '#E8A33D', marginTop: 10 }}>
                    {eventName}
                  </Text>
                ) : null}
                <Text style={{ fontFamily: 'Inter', fontSize: 10, color: '#7D7156', marginTop: 16, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                  {generatedAt}
                </Text>
              </View>

              <View style={{ flex: 1, justifyContent: 'flex-start', paddingTop: 20 }}>
                {chunk.centerBottom.map((w, i) => <PosterWishNote key={w._id} w={w} index={i + 20} />)}
              </View>
            </View>

            {/* Colonne Droite */}
            <View style={s.posterColumnSide}>
              {chunk.right.map((w, i) => <PosterWishNote key={w._id} w={w} index={i + 30} />)}
            </View>
          </Page>
        ))
      ) : isMosaic ? (
        <Page size="A4" style={s.mosaicPage}>
          <View style={s.mosaicColumns}>
            {splitMosaic(wishes).map((col, ci) => (
              <View key={ci} style={s.mosaicColumn}>
                {col.map(w => (
                  <WishNote key={w._id} w={w} style={s.mosaicNote} />
                ))}
              </View>
            ))}
          </View>
        </Page>
      ) : (
        wishes.map((w, i) => (
          <Page key={w._id} size="A5" style={s.wishPage}>
            <WishNote w={w} style={s.wishNote} />
            <Text style={s.pageNum}>{i + 1} / {wishCount}</Text>
          </Page>
        ))
      )}

      {/* Thank you page */}
      {publication?.thankYouMessage?.trim() ? (
        <Page size={pageSize} style={s.thankyouPage}>
          <View style={s.thankyouInner}>
            <Text style={s.thankyouKicker}>Un mot pour vous tous</Text>
            <Text style={s.thankyouBody}>{publication.thankYouMessage.trim()}</Text>
            <Text style={s.thankyouSig}>— {recipient}</Text>
          </View>
        </Page>
      ) : null}

      {/* Outro */}
      <Page size={pageSize} style={s.outroPage}>
        <Text style={s.outroMark}>myKado</Text>
        <Text style={s.outroTag}>Généré le {generatedAt}</Text>
      </Page>
    </Document>
  );
}
