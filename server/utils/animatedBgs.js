/* ================================================================
   Fonds animés — palettes + factories HTML partagées.
   Consommé par :
     - server/routes/serve.js (injection dans window.__WW_ANIMATED_BGS__
       pour le rendu statique du template + rotation par story)
     - server/services/wallBookPdf.js (fond des pages "mot" du livre PDF)
   Miroir côté client : client/wall/AnimatedBackground.jsx (JSX).
   ================================================================ */

const CONTAINER_STYLE = 'position: fixed; inset: 0; z-index: -1; overflow: hidden; pointer-events: none;';

const BG_FACTORIES = {
  'bg-blob': (p) => `<div class="ab-container" style="background: linear-gradient(155deg,${p.mid} 0%,${p.dark} 45%,${p.bg} 100%); ${CONTAINER_STYLE}">`
    + `<div style="position: absolute; top: -60px; left: -40px; width: 280px; height: 280px; border-radius: 50%; background: radial-gradient(circle,${p.blob1},transparent 70%); filter: blur(38px); animation: mkBlobA 12s ease-in-out infinite;"></div>`
    + `<div style="position: absolute; bottom: 20px; right: -60px; width: 300px; height: 300px; border-radius: 50%; background: radial-gradient(circle,${p.blob2},transparent 70%); filter: blur(42px); animation: mkBlobB 14s ease-in-out infinite;"></div>`
    + `<div style="position: absolute; bottom: -70px; left: 30px; width: 240px; height: 240px; border-radius: 50%; background: radial-gradient(circle,${p.blob3},transparent 70%); filter: blur(40px); animation: mkBlobA 16s ease-in-out infinite 2s;"></div>`
    + `</div>`,

  'bg-polka': (p) => `<div class="ab-container" style="background: linear-gradient(160deg,${p.top},${p.bottom}); ${CONTAINER_STYLE}">`
    + `<div style="position: absolute; inset: -20px; background-image: radial-gradient(rgba(255,255,255,.42) 3.4px,transparent 4px),radial-gradient(${p.dotDark} 3.4px,transparent 4px); background-size: 26px 26px,26px 26px; background-position: 0 0,13px 13px; animation: mkDots 5.5s linear infinite;"></div>`
    + `<div style="position: absolute; inset: 0; background: radial-gradient(circle at 50% 48%,${p.center},transparent 52%);"></div>`
    + `</div>`,

  'bg-bokeh': (p) => `<div class="ab-container" style="background: radial-gradient(120% 90% at 50% 15%,${p.mid} 0%,${p.dark} 55%,${p.bg} 100%); ${CONTAINER_STYLE}">`
    + `<div style="position: absolute; top: 120px; left: 40px; width: 90px; height: 90px; border-radius: 50%; background: radial-gradient(circle,${p.dot1},transparent 70%); filter: blur(6px); animation: mkFloat 7s ease-in-out infinite;"></div>`
    + `<div style="position: absolute; top: 240px; right: 36px; width: 130px; height: 130px; border-radius: 50%; background: radial-gradient(circle,${p.dot2},transparent 70%); filter: blur(8px); animation: mkFloat2 9s ease-in-out infinite 1s;"></div>`
    + `<div style="position: absolute; bottom: 180px; left: 24px; width: 70px; height: 70px; border-radius: 50%; background: radial-gradient(circle,${p.dot3},transparent 70%); filter: blur(5px); animation: mkDrift 8s ease-in-out infinite .5s;"></div>`
    + `<div style="position: absolute; bottom: 120px; right: 60px; width: 50px; height: 50px; border-radius: 50%; background: radial-gradient(circle,${p.dot1},transparent 70%); filter: blur(4px); animation: mkFloat 6s ease-in-out infinite 1.5s;"></div>`
    + `<div style="position: absolute; top: 340px; left: 120px; width: 34px; height: 34px; border-radius: 50%; background: radial-gradient(circle,${p.dot3},transparent 70%); filter: blur(3px); animation: mkFloat2 7.5s ease-in-out infinite;"></div>`
    + `</div>`,

  'bg-comic': (p) => `<div class="ab-container" style="background: ${p.bg}; ${CONTAINER_STYLE}">`
    + `<div style="position: absolute; top: 50%; left: 50%; width: 250vmax; height: 250vmax; margin: -125vmax 0 0 -125vmax; background: repeating-conic-gradient(from 0deg,${p.stripe} 0 2.2deg,transparent 2.2deg 8deg); opacity: .9; animation: mkZoom 3.6s ease-in-out infinite;"></div>`
    + `<div style="position: absolute; inset: 0; background: radial-gradient(circle at 50% 48%,${p.bg} 0%,${p.bg} 24%,transparent 42%);"></div>`
    + `</div>`,

  'bg-synthwave': (p) => `<div class="ab-container" style="background: linear-gradient(180deg,${p.top} 0%,${p.mid1} 46%,${p.mid2} 58%,${p.bottom} 100%); ${CONTAINER_STYLE}">`
    + `<div style="position: absolute; top: 150px; left: 50%; transform: translateX(-50%); width: 180px; height: 180px; border-radius: 50%; background: radial-gradient(circle,${p.sunCore} 0%,${p.sunEdge} 45%,${p.sunFade} 72%); filter: blur(2px);"></div>`
    + `<div style="position: absolute; left: 0; right: 0; bottom: 0; height: 340px; overflow: hidden; perspective: 280px;">`
    + `<div style="position: absolute; left: -50%; right: -50%; bottom: -40px; height: 520px; background-image: linear-gradient(${p.grid} 2px,transparent 2px),linear-gradient(90deg,${p.grid} 2px,transparent 2px); background-size: 52px 52px; transform: rotateX(66deg); transform-origin: bottom center; animation: mkGrid 2.4s linear infinite;"></div>`
    + `<div style="position: absolute; inset: 0; background: linear-gradient(180deg,${p.bottom} 0%,transparent 34%,transparent 78%,${p.bottomFade});"></div>`
    + `</div></div>`,

  'bg-sunburst': (p) => `<div class="ab-container" style="background: ${p.bg}; ${CONTAINER_STYLE}">`
    + `<div style="position: absolute; top: 50%; left: 50%; width: 250vmax; height: 250vmax; margin: -125vmax 0 0 -125vmax; background: repeating-conic-gradient(from 0deg,${p.ray1} 0 10deg,${p.ray2} 10deg 20deg); animation: mkSunA 78s linear infinite;"></div>`
    + `<div style="position: absolute; inset: 0; background: radial-gradient(circle at 50% 46%,${p.centerGlow} 0%,transparent 46%),radial-gradient(circle at 50% 48%,${p.vignette} 0%,transparent 62%),radial-gradient(circle at 50% 120%,transparent 55%,${p.bottomFade});"></div>`
    + `</div>`,
};

const BG_VARIANTS = {
  'bg-blob': [
    { id: 'nocturne', mid:'#243157', dark:'#1A234A', bg:'#141B3B', blob1:'#3A4C8A',                blob2:'rgba(232,163,61,.55)',  blob3:'rgba(138,99,210,.5)' },
    { id: 'sunset',   mid:'#8F2E3D', dark:'#5C1B2E', bg:'#3A0F1E', blob1:'rgba(242,126,95,.65)',  blob2:'rgba(255,201,122,.55)', blob3:'rgba(184,76,110,.55)' },
    { id: 'ocean',    mid:'#175A7A', dark:'#0F3959', bg:'#0A2540', blob1:'rgba(79,193,233,.6)',   blob2:'rgba(184,236,236,.5)',  blob3:'rgba(90,123,184,.55)' },
    { id: 'prairie',  mid:'#2E7256', dark:'#1B4033', bg:'#0D2A1F', blob1:'rgba(136,193,112,.6)',  blob2:'rgba(214,245,143,.5)',  blob3:'rgba(107,175,159,.55)' },
    { id: 'cerise',   mid:'#8B1E5A', dark:'#4A0F35', bg:'#2D0A20', blob1:'rgba(247,107,159,.6)',  blob2:'rgba(255,181,208,.55)', blob3:'rgba(200,71,142,.55)' },
  ],
  'bg-polka': [
    { id: 'sunlit', top:'#F0B24C', bottom:'#E4922B', dotDark:'rgba(58,36,16,.14)',  center:'rgba(255,251,242,.55)' },
    { id: 'rose',   top:'#F8A5C2', bottom:'#E85A8F', dotDark:'rgba(120,20,60,.16)', center:'rgba(255,245,250,.55)' },
    { id: 'sky',    top:'#8ECBFF', bottom:'#4F9FEC', dotDark:'rgba(20,50,110,.16)', center:'rgba(240,250,255,.55)' },
    { id: 'mint',   top:'#A9E3C4', bottom:'#5FBE8C', dotDark:'rgba(20,80,50,.16)',  center:'rgba(245,255,250,.55)' },
    { id: 'lilac',  top:'#CBB5F0', bottom:'#9A7DD8', dotDark:'rgba(50,30,110,.16)', center:'rgba(250,247,255,.55)' },
  ],
  'bg-bokeh': [
    { id: 'nocturne', mid:'#3A2450', dark:'#241634', bg:'#160D22', dot1:'rgba(242,214,138,.55)', dot2:'rgba(214,164,220,.4)',  dot3:'rgba(255,255,255,.35)' },
    { id: 'ocean',    mid:'#0F3959', dark:'#0A2540', bg:'#061424', dot1:'rgba(184,236,236,.5)',  dot2:'rgba(79,193,233,.4)',   dot3:'rgba(255,255,255,.3)' },
    { id: 'cerise',   mid:'#4A0F35', dark:'#2D0A20', bg:'#1A0512', dot1:'rgba(255,181,208,.5)',  dot2:'rgba(247,107,159,.4)',  dot3:'rgba(255,255,255,.32)' },
    { id: 'prairie',  mid:'#1B4033', dark:'#0D2A1F', bg:'#061511', dot1:'rgba(214,245,143,.5)',  dot2:'rgba(136,193,112,.4)',  dot3:'rgba(255,255,255,.32)' },
    { id: 'ember',    mid:'#4E1810', dark:'#2B0C08', bg:'#180504', dot1:'rgba(255,163,110,.5)',  dot2:'rgba(255,215,110,.42)', dot3:'rgba(255,255,255,.3)' },
  ],
  'bg-comic': [
    { id: 'sunlit', bg:'#F2D24C', stripe:'#161311' },
    { id: 'rose',   bg:'#F7B0CB', stripe:'#2D0A20' },
    { id: 'sky',    bg:'#A8D8F5', stripe:'#0A2540' },
    { id: 'mint',   bg:'#B4E5C9', stripe:'#0D2A1F' },
    { id: 'coral',  bg:'#F8B598', stripe:'#3A0F1E' },
  ],
  'bg-synthwave': [
    { id: 'retrowave', top:'#1A1140', mid1:'#2A1550', mid2:'#3E1C5E', bottom:'#160D22', bottomFade:'rgba(22,13,34,.7)',  sunCore:'#F2D68A', sunEdge:'#E8A33D', sunFade:'rgba(232,163,61,0)', grid:'rgba(232,163,61,.55)' },
    { id: 'vapor',     top:'#2D0A50', mid1:'#4A1570', mid2:'#5E1C8A', bottom:'#180530', bottomFade:'rgba(24,5,48,.7)',   sunCore:'#FFC3E8', sunEdge:'#F76BC0', sunFade:'rgba(247,107,192,0)', grid:'rgba(247,107,192,.55)' },
    { id: 'cyber',     top:'#0A2038', mid1:'#0F3959', mid2:'#175A7A', bottom:'#061224', bottomFade:'rgba(6,18,36,.7)',   sunCore:'#B8ECEC', sunEdge:'#4FC1E9', sunFade:'rgba(79,193,233,0)',  grid:'rgba(79,193,233,.55)' },
    { id: 'sunwave',   top:'#3A0F1E', mid1:'#5C1B2E', mid2:'#8F2E3D', bottom:'#1F0812', bottomFade:'rgba(31,8,18,.7)',   sunCore:'#FFC97A', sunEdge:'#F27E5F', sunFade:'rgba(242,126,95,0)',  grid:'rgba(255,201,122,.55)' },
    { id: 'mintwave',  top:'#0D2A20', mid1:'#1B4033', mid2:'#2E7256', bottom:'#061511', bottomFade:'rgba(6,21,17,.7)',   sunCore:'#D6F58F', sunEdge:'#88C170', sunFade:'rgba(136,193,112,0)', grid:'rgba(214,245,143,.55)' },
  ],
  'bg-sunburst': [
    { id: 'twilight', bg:'#1B2450', ray1:'#2C3A6E', ray2:'#1C264F', centerGlow:'rgba(232,163,61,.18)', vignette:'rgba(15,18,40,.5)', bottomFade:'rgba(11,14,32,.72)' },
    { id: 'rose',     bg:'#3A0F1E', ray1:'#5C1B2E', ray2:'#2C0913', centerGlow:'rgba(255,201,122,.22)', vignette:'rgba(31,8,18,.5)', bottomFade:'rgba(22,4,12,.75)' },
    { id: 'ocean',    bg:'#0A2540', ray1:'#0F3959', ray2:'#061A2E', centerGlow:'rgba(184,236,236,.2)',  vignette:'rgba(6,18,36,.5)', bottomFade:'rgba(4,12,25,.75)' },
    { id: 'ember',    bg:'#2B0C08', ray1:'#4E1810', ray2:'#1A0603', centerGlow:'rgba(255,163,110,.24)', vignette:'rgba(24,5,4,.5)',  bottomFade:'rgba(15,3,2,.75)' },
    { id: 'cerise',   bg:'#2D0A20', ray1:'#4A0F35', ray2:'#1E0716', centerGlow:'rgba(255,181,208,.2)',  vignette:'rgba(26,8,20,.5)', bottomFade:'rgba(15,3,10,.75)' },
  ],
};

/* Produit cartésien : { 'bg-blob:nocturne': '<html>', ... } — 30 entrées. */
const ANIMATED_BGS = {};
Object.entries(BG_FACTORIES).forEach(([bgId, factory]) => {
  (BG_VARIANTS[bgId] || []).forEach((variant) => {
    ANIMATED_BGS[`${bgId}:${variant.id}`] = factory(variant);
  });
});

/* Toutes les clés au format 'bg-type:variant', pour rotation aléatoire. */
const BG_VARIANT_KEYS = Object.keys(ANIMATED_BGS);

/* Retourne l'HTML brut d'une palette donnée par clé combinée. */
function getBgHtml(key) {
  return ANIMATED_BGS[key] || '';
}

/* Séquence aléatoire sans deux clés adjacentes identiques.
   Utilisé pour PDF (rotation par page) + stories (rotation par slide). */
function pickBgSequence(count, keys = BG_VARIANT_KEYS) {
  if (!count || !keys.length) return [];
  const out = [];
  let last = null;
  for (let i = 0; i < count; i++) {
    const pool = last ? keys.filter(k => k !== last) : keys;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    out.push(pick);
    last = pick;
  }
  return out;
}

module.exports = {
  BG_FACTORIES,
  BG_VARIANTS,
  ANIMATED_BGS,
  BG_VARIANT_KEYS,
  getBgHtml,
  pickBgSequence,
};
