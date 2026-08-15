import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { QrCode } from 'lucide-react';
import s from './QrStories.module.css';

/* ── Contenu des 4 moments ──────────────────────────────────────
   Chaque carte a :
   - un visuel (image dans /public/qr-stories/, fallback SVG inline)
   - un numéro, titre, description
   - des pills (variantes / supports)
   - une teinte (palette Kado)
   L'illustration inline sert de fallback si l'image n'est pas fournie. */

const STORIES = [
  {
    id: 'jewel',
    num: '01',
    kicker: 'Porte-le sur toi',
    title: 'Ton souvenir devient bijou.',
    lead: 'Grave le QR sur une bague, un bracelet, un collier. Un scan et la carte rejoue — partout, à tout moment.',
    pills: ['Bague', 'Bracelet', 'Collier', 'Médaillon'],
    tint: 'rose',
    image: '/qr-stories/jewel.webp',
    Illustration: JewelIllustration,
  },
  {
    id: 'frame',
    num: '02',
    kicker: 'Accroche-le au mur',
    title: 'Un cadre. Un scan. Un souvenir qui rejoue.',
    lead: 'Encadre la photo, glisse le QR au dos ou en filigrane. Chaque passant devient invité de la fête.',
    pills: ['Salon', 'Chevet', 'Bureau', 'Cadeau'],
    tint: 'gold',
    image: '/qr-stories/frame.webp',
    Illustration: FrameIllustration,
  },
  {
    id: 'book',
    num: '03',
    kicker: 'Feuillette les souvenirs',
    title: 'Un livre d\'or qui traverse les années.',
    lead: 'Tous les messages du mur, mis en page, prêts à imprimer. PDF haute qualité, format cadeau.',
    pills: ['PDF A4', 'A5 carré', 'Impression pro'],
    tint: 'indigo',
    image: '/qr-stories/book.webp',
    Illustration: BookIllustration,
  },
  {
    id: 'video',
    num: '04',
    kicker: 'Regarde-la en boucle',
    title: 'Une vidéo souvenir prête à partager.',
    lead: 'Export MP4 avec musique, photos, transitions. WhatsApp, Insta, TikTok — tout accepte.',
    pills: ['MP4', '9:16 vertical', '16:9 story'],
    tint: 'mint',
    image: '/qr-stories/video.webp',
    Illustration: VideoIllustration,
  },
];

/* ── Flèche cursive (comme la capture) ─────────────────────────
   SVG dessiné à la main, path animé au scroll via dash-offset. */
function CursiveArrow({ variant = 'right', className = '' }) {
  // variant: 'right' | 'down' | 'downLeft'
  const paths = {
    right:    'M8 20 C 60 8, 120 8, 168 44 M168 44 L 152 30 M168 44 L 154 58',
    down:     'M40 6 C 6 40, 6 90, 40 138 M40 138 L 24 122 M40 138 L 56 122',
    downLeft: 'M140 8 C 90 40, 40 60, 12 128 M12 128 L 30 116 M12 128 L 20 108',
  };
  const viewBox = variant === 'right' ? '0 0 180 68' : (variant === 'down' ? '0 0 80 148' : '0 0 150 140');
  return (
    <svg viewBox={viewBox} className={`${s.arrow} ${className}`} aria-hidden="true">
      <path
        d={paths[variant]}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Illustrations SVG fallback (si image absente) ─────────── */
function JewelIllustration() {
  return (
    <svg viewBox="0 0 400 400" className={s.illustration} aria-hidden="true">
      <defs>
        <radialGradient id="jewelGlow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="130" fill="url(#jewelGlow)" />
      {/* Bague */}
      <ellipse cx="200" cy="240" rx="105" ry="95" fill="none" stroke="currentColor" strokeWidth="14" opacity="0.85" />
      <ellipse cx="200" cy="240" rx="105" ry="95" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="2" />
      {/* Pierre / QR */}
      <g transform="translate(200 130)">
        <rect x="-32" y="-32" width="64" height="64" rx="10" fill="#ffffff" stroke="currentColor" strokeWidth="2.5" />
        <g fill="#161311">
          <rect x="-24" y="-24" width="12" height="12" />
          <rect x="-24" y="12" width="12" height="12" />
          <rect x="12" y="-24" width="12" height="12" />
          <rect x="-4" y="-4" width="8" height="8" />
          <rect x="4" y="12" width="6" height="6" />
          <rect x="-14" y="4" width="6" height="6" />
          <rect x="14" y="4" width="6" height="6" />
          <rect x="-4" y="14" width="6" height="6" />
        </g>
        <circle cx="0" cy="-45" r="6" fill="currentColor" opacity="0.6" />
      </g>
    </svg>
  );
}

function FrameIllustration() {
  return (
    <svg viewBox="0 0 400 400" className={s.illustration} aria-hidden="true">
      {/* Etagère */}
      <line x1="40" y1="340" x2="360" y2="340" stroke="currentColor" strokeWidth="3" opacity="0.35" />
      {/* Cadre */}
      <g transform="translate(200 190)">
        <rect x="-115" y="-135" width="230" height="270" rx="6" fill="#ffffff" stroke="currentColor" strokeWidth="8" />
        <rect x="-92" y="-112" width="184" height="220" rx="2" fill="currentColor" opacity="0.12" />
        {/* Silhouette photo */}
        <circle cx="0" cy="-40" r="28" fill="currentColor" opacity="0.35" />
        <path d="M-70 90 C -70 30, -30 20, 0 20 C 30 20, 70 30, 70 90 Z" fill="currentColor" opacity="0.35" />
        {/* Chevalet */}
        <path d="M-60 135 L -110 175" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <path d="M60 135 L 110 175" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      </g>
      {/* QR corner */}
      <g transform="translate(300 90)">
        <rect x="-24" y="-24" width="48" height="48" rx="6" fill="#ffffff" stroke="currentColor" strokeWidth="2" />
        <g fill="#161311">
          <rect x="-18" y="-18" width="8" height="8" />
          <rect x="10" y="-18" width="8" height="8" />
          <rect x="-18" y="10" width="8" height="8" />
          <rect x="-2" y="-2" width="4" height="4" />
          <rect x="6" y="6" width="4" height="4" />
        </g>
      </g>
    </svg>
  );
}

function BookIllustration() {
  return (
    <svg viewBox="0 0 400 400" className={s.illustration} aria-hidden="true">
      <g transform="translate(200 200)">
        {/* Base ombre */}
        <ellipse cx="0" cy="130" rx="150" ry="12" fill="currentColor" opacity="0.15" />
        {/* Livre ouvert */}
        <path d="M-140 -100 L 0 -90 L 140 -100 L 140 100 L 0 110 L -140 100 Z" fill="#ffffff" stroke="currentColor" strokeWidth="4" />
        <line x1="0" y1="-90" x2="0" y2="110" stroke="currentColor" strokeWidth="3" opacity="0.55" />
        {/* Lignes de texte page gauche */}
        <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.45">
          <line x1="-118" y1="-60" x2="-22" y2="-58" />
          <line x1="-118" y1="-38" x2="-38" y2="-36" />
          <line x1="-118" y1="-16" x2="-30" y2="-14" />
          <line x1="-118" y1="6"   x2="-46" y2="8" />
          <line x1="-118" y1="28"  x2="-30" y2="30" />
          <line x1="-118" y1="50"  x2="-62" y2="52" />
        </g>
        {/* Lignes page droite */}
        <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.45">
          <line x1="22" y1="-58" x2="118" y2="-60" />
          <line x1="22" y1="-36" x2="102" y2="-38" />
          <line x1="22" y1="-14" x2="118" y2="-16" />
          <line x1="22" y1="8"   x2="86"  y2="6" />
          <line x1="22" y1="30"  x2="118" y2="28" />
        </g>
        {/* Cœur mémoriel */}
        <path d="M78 66 c -8 -14 -30 -12 -30 6 c 0 12 14 20 22 26 c 8 -6 22 -14 22 -26 c 0 -18 -22 -20 -30 -6 z" fill="currentColor" opacity="0.7" transform="translate(-16 6)" />
      </g>
    </svg>
  );
}

function VideoIllustration() {
  return (
    <svg viewBox="0 0 400 400" className={s.illustration} aria-hidden="true">
      <g transform="translate(200 200)">
        {/* Phone */}
        <rect x="-90" y="-160" width="180" height="320" rx="24" fill="#161311" stroke="currentColor" strokeWidth="4" />
        <rect x="-76" y="-146" width="152" height="292" rx="12" fill="#ffffff" />
        {/* Ecran contenu : image */}
        <rect x="-72" y="-142" width="144" height="200" rx="8" fill="currentColor" opacity="0.15" />
        {/* Play button */}
        <circle cx="0" cy="-42" r="30" fill="#ffffff" />
        <path d="M-8 -52 L 14 -42 L -8 -32 Z" fill="currentColor" />
        {/* Timeline */}
        <rect x="-64" y="80" width="128" height="6" rx="3" fill="currentColor" opacity="0.2" />
        <rect x="-64" y="80" width="82" height="6" rx="3" fill="currentColor" />
        <circle cx="18" cy="83" r="7" fill="currentColor" />
        {/* Waves */}
        <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.55">
          <line x1="-52" y1="112" x2="-52" y2="126" />
          <line x1="-38" y1="106" x2="-38" y2="132" />
          <line x1="-24" y1="114" x2="-24" y2="124" />
          <line x1="-10" y1="100" x2="-10" y2="138" />
          <line x1="4"   y1="108" x2="4"   y2="130" />
          <line x1="18"  y1="112" x2="18"  y2="126" />
          <line x1="32"  y1="104" x2="32"  y2="134" />
          <line x1="46"  y1="114" x2="46"  y2="124" />
        </g>
      </g>
    </svg>
  );
}

/* ── Une carte du stack ─────────────────────────────────────
   Toutes les cards sont SIBLINGS dans .stack (même containing
   block) → chaque card sticky s'ancre à son propre `top` et
   RESTE visible pendant que les suivantes remontent par-dessus.
   Chaque card réserve son scroll-space via margin-bottom. */
function StickyCard({ story, index, total }) {
  const ref = useRef(null);
  // Progrès du scroll pour CETTE card, du moment où elle atteint son sticky
  // jusqu'au moment où la card suivante l'a complètement recouverte.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  // Quand la card suivante arrive par-dessus, on rétrécit légèrement pour
  // simuler l'ombre / la profondeur d'un vrai deck.
  const scale = useTransform(scrollYProgress, [0.35, 1], [1, 0.92]);
  const brightness = useTransform(scrollYProgress, [0.35, 1], [1, 0.88]);
  const filter = useTransform(brightness, (b) => `brightness(${b})`);

  const isLast = index === total - 1;
  // Chaque carte s'ancre légèrement plus bas → on voit les tranches
  // supérieures des cards précédentes, comme un vrai deck.
  const topOffset = `calc(var(--stack-top) + ${index * 22}px)`;

  const Illustration = story.Illustration;

  return (
    <motion.article
      ref={ref}
      className={`${s.card} ${s[`tint_${story.tint}`]}`}
      style={{
        top: topOffset,
        zIndex: 10 + index,
        scale,
        filter,
      }}
    >
      <div className={s.cardInner}>
        <div className={s.cardText}>
          <div className={s.numRow}>
            <span className={s.num}>{story.num}</span>
            <span className={s.kicker}>{story.kicker}</span>
          </div>
          <h3 className={s.cardTitle}>{story.title}</h3>
          <p className={s.cardLead}>{story.lead}</p>
          <div className={s.pills}>
            {story.pills.map((p) => (
              <span key={p} className={s.pill}>
                {p}
              </span>
            ))}
          </div>
          <div className={s.qrHint}>
            <QrCode size={16} strokeWidth={2.4} />
            <span>Un seul QR, tous les supports.</span>
          </div>
        </div>

        <div className={s.cardVisual}>
          {/* Image réelle si présente, sinon illustration SVG fallback */}
          <img
            src={story.image}
            alt=""
            className={s.cardImage}
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <Illustration />
          {/* QR badge overlay flottant */}
          <div className={s.qrBadge} aria-hidden="true">
            <svg viewBox="0 0 32 32" width="32" height="32">
              <rect x="1"  y="1"  width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" />
              <rect x="21" y="1"  width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" />
              <rect x="1"  y="21" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" />
              <rect x="4"  y="4"  width="4" height="4" fill="currentColor" />
              <rect x="24" y="4"  width="4" height="4" fill="currentColor" />
              <rect x="4"  y="24" width="4" height="4" fill="currentColor" />
              <rect x="14" y="14" width="4" height="4" fill="currentColor" />
              <rect x="20" y="16" width="3" height="3" fill="currentColor" />
              <rect x="16" y="20" width="3" height="3" fill="currentColor" />
              <rect x="24" y="16" width="3" height="3" fill="currentColor" />
              <rect x="16" y="24" width="3" height="3" fill="currentColor" />
              <rect x="26" y="24" width="3" height="3" fill="currentColor" />
            </svg>
          </div>
          {/* Flèche cursive qui pointe vers le QR */}
          {index === 0 && (
            <div className={s.arrowToQr}>
              <CursiveArrow variant="downLeft" />
              <span className={s.arrowLabel}>scanne&nbsp;!</span>
            </div>
          )}
        </div>
      </div>

      {/* Indicateur "continue" en bas (sauf dernière) */}
      {!isLast && (
        <div className={s.nextHint} aria-hidden="true">
          <CursiveArrow variant="down" />
          <span>continue…</span>
        </div>
      )}
    </motion.article>
  );
}

export default function QrStories() {
  return (
    <section id="qr-stories" className={s.section}>
      <div className={`mk-container ${s.container}`}>
        <div className={s.head}>
          <span className="eyebrow">Après la carte</span>
          <h2 className={s.title}>
            Un QR, et ton souvenir<br />
            <em className={s.titleAccent}>prend forme.</em>
          </h2>
          <p className={s.sub}>
            Ta carte ne reste pas dans le téléphone. Elle devient bijou, cadre, livre, vidéo.
            <br />Un seul QR — quatre façons de la faire vivre.
          </p>
          <div className={s.headArrow} aria-hidden="true">
            <CursiveArrow variant="down" />
          </div>
        </div>

        <div className={s.stack}>
          {STORIES.map((story, i) => (
            <StickyCard key={story.id} story={story} index={i} total={STORIES.length} />
          ))}
        </div>
      </div>
    </section>
  );
}
