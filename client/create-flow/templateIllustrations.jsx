/* Illustrations SVG dédiées à CHAQUE template (pas aux types abstraits).
   Utilisées :
   - dans TemplateStep.jsx (étape 3 wish de /create) pour birthday/forever/notre-film
   - dans les listes de créations (Dashboard "Récents", MyCreations, etc.) comme
     fallback quand pub.thumbnail est absent.

   Palette Kado : rose #FF5470, gold #FFC145, ink #2B2440, lilac #7C5CFF,
   mint #00A48D, sky #5CC8FF, peach #FF9F7A. Fond blanc sous-jacent.
   ViewBox 160×120 (ratio 4:3) pour toutes — même sizing. */

/* ══ WISH ═══════════════════════════════════════════════════════ */

export function BirthdayIllustration() {
  return (
    <svg viewBox="0 0 160 120" aria-hidden style={{ width: '100%', height: '100%', display: 'block' }}>
      {/* Confettis autour */}
      <circle cx="26" cy="16" r="3" fill="#FF5470" />
      <rect x="128" y="14" width="5" height="5" rx="1" fill="#FFC145" transform="rotate(20 130 16)" />
      <path d="M20 40 l3 3 -3 3 -3 -3 z" fill="#7C5CFF" />
      <path d="M140 44 l3 3 -3 3 -3 -3 z" fill="#00A48D" />
      <circle cx="80" cy="10" r="2.5" fill="#FFC145" />
      <rect x="46" y="20" width="4" height="4" rx="1" fill="#5CC8FF" />
      <rect x="106" y="24" width="4" height="4" rx="1" fill="#FF5470" />

      {/* Plateau */}
      <ellipse cx="80" cy="102" rx="52" ry="5" fill="#EAD6DE" />

      {/* Étage inférieur + glaçage */}
      <rect x="30" y="70" width="100" height="30" rx="3" fill="#FFDCE3" stroke="#2B2440" strokeWidth="2" />
      <path
        d="M30 80 q10 8 20 0 t20 0 t20 0 t20 0 t20 0"
        fill="#FFF3F5"
        stroke="#FF5470"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Étage supérieur */}
      <rect x="52" y="48" width="56" height="26" rx="3" fill="#FFF3F5" stroke="#2B2440" strokeWidth="2" />
      <path
        d="M52 58 q7 6 14 0 t14 0 t14 0 t14 0"
        fill="none"
        stroke="#FFC145"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Bougies */}
      <rect x="63" y="30" width="4" height="18" rx="1" fill="#FFC145" stroke="#2B2440" strokeWidth="1.4" />
      <rect x="78" y="26" width="4" height="22" rx="1" fill="#FF5470" stroke="#2B2440" strokeWidth="1.4" />
      <rect x="93" y="30" width="4" height="18" rx="1" fill="#7C5CFF" stroke="#2B2440" strokeWidth="1.4" />

      {/* Flammes */}
      <path d="M65 30 c-2 -3 -1 -7 0 -9 c1 2 2 6 0 9 z" fill="#FFC145" stroke="#2B2440" strokeWidth="1" />
      <path d="M80 26 c-2 -3 -1 -7 0 -9 c1 2 2 6 0 9 z" fill="#FFC145" stroke="#2B2440" strokeWidth="1" />
      <path d="M95 30 c-2 -3 -1 -7 0 -9 c1 2 2 6 0 9 z" fill="#FFC145" stroke="#2B2440" strokeWidth="1" />
    </svg>
  );
}

export function ForeverIllustration() {
  return (
    <svg viewBox="0 0 160 120" aria-hidden style={{ width: '100%', height: '100%', display: 'block' }}>
      <path d="M18 16 c0 -4 6 -4 6 0 c4 0 4 6 0 6 c0 4 -6 4 -6 0 c-4 0 -4 -6 0 -6 z" fill="#FFDCE3" />
      <path d="M138 20 c0 -4 6 -4 6 0 c4 0 4 6 0 6 c0 4 -6 4 -6 0 c-4 0 -4 -6 0 -6 z" fill="#EDE7FF" />
      <circle cx="24" cy="100" r="2.5" fill="#FF5470" />
      <circle cx="138" cy="98" r="2.5" fill="#FFC145" />
      <path d="M14 60 l3 3 -3 3 -3 -3 z" fill="#7C5CFF" />
      <path d="M146 64 l3 3 -3 3 -3 -3 z" fill="#00A48D" />

      {/* Arche florale */}
      <path
        d="M28 84 q52 -72 104 0"
        fill="none"
        stroke="#FFB3C0"
        strokeWidth="2"
        strokeDasharray="3 5"
      />

      {/* Alliance gauche */}
      <circle cx="66" cy="78" r="22" fill="none" stroke="#FFC145" strokeWidth="5" />
      <circle cx="66" cy="78" r="22" fill="none" stroke="#2B2440" strokeWidth="1.2" />
      <path d="M66 51 l5 8 -5 8 -5 -8 z" fill="#5CC8FF" stroke="#2B2440" strokeWidth="1.2" />

      {/* Alliance droite */}
      <circle cx="94" cy="78" r="22" fill="none" stroke="#FFC145" strokeWidth="5" />
      <circle cx="94" cy="78" r="22" fill="none" stroke="#2B2440" strokeWidth="1.2" />
      <path d="M94 51 l5 8 -5 8 -5 -8 z" fill="#5CC8FF" stroke="#2B2440" strokeWidth="1.2" />

      {/* Cœur central */}
      <path
        d="M80 82 c-7 -9 -20 -4 -13 6 c3 7 13 13 13 13 c0 0 10 -6 13 -13 c7 -10 -6 -15 -13 -6 z"
        fill="#FF5470"
        stroke="#2B2440"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function NotreFilmIllustration() {
  return (
    <svg viewBox="0 0 160 120" aria-hidden style={{ width: '100%', height: '100%', display: 'block' }}>
      <circle cx="20" cy="16" r="2.5" fill="#FFC145" />
      <circle cx="140" cy="14" r="2.5" fill="#7C5CFF" />
      <rect x="18" y="100" width="5" height="5" rx="1" fill="#FF5470" />
      <path d="M138 98 l3 3 -3 3 -3 -3 z" fill="#00A48D" />

      {/* Bande de film */}
      <rect x="12" y="46" width="136" height="44" rx="4" fill="#2B2440" />
      <rect x="12" y="46" width="136" height="7" fill="#000000" opacity=".35" />
      <rect x="12" y="83" width="136" height="7" fill="#000000" opacity=".35" />

      {/* Sprocket holes */}
      <g fill="#FFFFFF">
        <rect x="20" y="48" width="4" height="3" rx="0.5" />
        <rect x="40" y="48" width="4" height="3" rx="0.5" />
        <rect x="60" y="48" width="4" height="3" rx="0.5" />
        <rect x="80" y="48" width="4" height="3" rx="0.5" />
        <rect x="100" y="48" width="4" height="3" rx="0.5" />
        <rect x="120" y="48" width="4" height="3" rx="0.5" />
        <rect x="136" y="48" width="4" height="3" rx="0.5" />
        <rect x="20" y="86" width="4" height="3" rx="0.5" />
        <rect x="40" y="86" width="4" height="3" rx="0.5" />
        <rect x="60" y="86" width="4" height="3" rx="0.5" />
        <rect x="80" y="86" width="4" height="3" rx="0.5" />
        <rect x="100" y="86" width="4" height="3" rx="0.5" />
        <rect x="120" y="86" width="4" height="3" rx="0.5" />
        <rect x="136" y="86" width="4" height="3" rx="0.5" />
      </g>

      {/* Vignettes */}
      <rect x="18" y="56" width="34" height="26" rx="2" fill="#FFDCE3" />
      <rect x="63" y="56" width="34" height="26" rx="2" fill="#FFF0C9" />
      <rect x="108" y="56" width="34" height="26" rx="2" fill="#EDE7FF" />

      <path d="M35 66 c-4 -5 -11 -2 -7 4 c2 4 7 7 7 7 c0 0 5 -3 7 -7 c4 -6 -3 -9 -7 -4 z" fill="#FF5470" opacity=".85" />
      <path
        d="M80 62 c-6 -8 -18 -4 -12 6 c3 6 12 12 12 12 c0 0 9 -6 12 -12 c6 -10 -6 -14 -12 -6 z"
        fill="#FF5470"
        stroke="#2B2440"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M125 64 l2 5 5.5 0 -4.5 3.2 1.8 5.3 -4.8 -3.3 -4.8 3.3 1.8 -5.3 -4.5 -3.2 5.5 0 z"
        fill="#FFC145"
        stroke="#2B2440"
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* Play badge */}
      <circle cx="132" cy="28" r="11" fill="#FFC145" stroke="#2B2440" strokeWidth="2" />
      <path d="M129 23 l8 5 -8 5 z" fill="#2B2440" />
    </svg>
  );
}

/* ══ ENVELOPE ══════════════════════════════════════════════════ */

export function MyEnvelopeIllustration() {
  return (
    <svg viewBox="0 0 160 120" aria-hidden style={{ width: '100%', height: '100%', display: 'block' }}>
      {/* Fleurs coins */}
      <path d="M14 20 c0 -6 8 -6 8 0 c6 0 6 8 0 8 c0 6 -8 6 -8 0 c-6 0 -6 -8 0 -8 z" fill="#FFDCE3" />
      <path d="M140 96 c0 -5 6 -5 6 0 c5 0 5 6 0 6 c0 5 -6 5 -6 0 c-5 0 -5 -6 0 -6 z" fill="#FFF0C9" />
      <circle cx="12" cy="92" r="3" fill="#FFC145" />
      <path d="M144 18 c0 -4 6 -4 6 0 c4 0 4 6 0 6 c0 4 -6 4 -6 0 c-4 0 -4 -6 0 -6 z" fill="#CFF2ED" />

      {/* Feuilles */}
      <path d="M30 32 q6 -6 12 -2 t-12 12 q-6 -4 0 -10 z" fill="#00A48D" opacity=".55" />
      <path d="M130 92 q-6 -6 -12 -2 t12 12 q6 -4 0 -10 z" fill="#00A48D" opacity=".55" />

      {/* Enveloppe */}
      <rect x="26" y="34" width="108" height="68" rx="6" fill="#FFFFFF" stroke="#2B2440" strokeWidth="2.5" />
      <path d="M26 40 L80 76 L134 40" fill="none" stroke="#2B2440" strokeWidth="2.5" strokeLinejoin="round" />

      {/* Cachet de cire cœur */}
      <circle cx="80" cy="76" r="11" fill="#FF5470" stroke="#2B2440" strokeWidth="2" />
      <path
        d="M80 73 c-2.5 -3 -7 -1 -5 3 c1 2.5 5 5 5 5 c0 0 4 -2.5 5 -5 c2 -4 -2.5 -6 -5 -3 z"
        fill="#FFFFFF"
      />

      {/* Petits pétales décoratifs */}
      <g transform="translate(34 92)">
        <circle cx="0" cy="0" r="3" fill="#FFC145" />
        <circle cx="6" cy="-2" r="3" fill="#FF5470" />
        <circle cx="4" cy="4" r="3" fill="#7C5CFF" />
      </g>
      <g transform="translate(126 44)">
        <circle cx="0" cy="0" r="3" fill="#FFC145" />
        <circle cx="-6" cy="-2" r="3" fill="#FF5470" />
        <circle cx="-4" cy="4" r="3" fill="#7C5CFF" />
      </g>
    </svg>
  );
}

/* ══ WALLS ═════════════════════════════════════════════════════ */

/* Classique — post-its pastel en grille, ambiance festive. */
export function WallOfWishesIllustration() {
  return (
    <svg viewBox="0 0 160 120" aria-hidden style={{ width: '100%', height: '100%', display: 'block' }}>
      <circle cx="14" cy="22" r="2.5" fill="#FFC145" />
      <circle cx="148" cy="98" r="2.5" fill="#FF5470" />
      <path d="M144 22 l3 3 -3 3 -3 -3 z" fill="#7C5CFF" />

      <g transform="rotate(-4 42 40)">
        <rect x="22" y="24" width="40" height="34" rx="4" fill="#FFDCE3" stroke="#2B2440" strokeWidth="1.8" />
        <rect x="28" y="32" width="24" height="3" rx="1.5" fill="#2B2440" opacity=".55" />
        <rect x="28" y="38" width="20" height="3" rx="1.5" fill="#2B2440" opacity=".35" />
        <rect x="28" y="44" width="16" height="3" rx="1.5" fill="#2B2440" opacity=".35" />
      </g>
      <g transform="rotate(3 80 38)">
        <rect x="60" y="22" width="40" height="34" rx="4" fill="#FFF0C9" stroke="#2B2440" strokeWidth="1.8" />
        <rect x="66" y="30" width="26" height="3" rx="1.5" fill="#2B2440" opacity=".55" />
        <rect x="66" y="36" width="22" height="3" rx="1.5" fill="#2B2440" opacity=".35" />
        <rect x="66" y="42" width="18" height="3" rx="1.5" fill="#2B2440" opacity=".35" />
      </g>
      <g transform="rotate(-2 118 42)">
        <rect x="98" y="26" width="40" height="34" rx="4" fill="#CFF2ED" stroke="#2B2440" strokeWidth="1.8" />
        <rect x="104" y="34" width="24" height="3" rx="1.5" fill="#2B2440" opacity=".55" />
        <rect x="104" y="40" width="20" height="3" rx="1.5" fill="#2B2440" opacity=".35" />
        <rect x="104" y="46" width="16" height="3" rx="1.5" fill="#2B2440" opacity=".35" />
      </g>
      <g transform="rotate(2 42 82)">
        <rect x="22" y="66" width="40" height="34" rx="4" fill="#EDE7FF" stroke="#2B2440" strokeWidth="1.8" />
        <rect x="28" y="74" width="22" height="3" rx="1.5" fill="#2B2440" opacity=".55" />
        <rect x="28" y="80" width="18" height="3" rx="1.5" fill="#2B2440" opacity=".35" />
        <rect x="28" y="86" width="24" height="3" rx="1.5" fill="#2B2440" opacity=".35" />
      </g>
      <g transform="rotate(-3 80 82)">
        <rect x="60" y="66" width="40" height="34" rx="4" fill="#DAF1FF" stroke="#2B2440" strokeWidth="1.8" />
        <rect x="66" y="74" width="24" height="3" rx="1.5" fill="#2B2440" opacity=".55" />
        <rect x="66" y="80" width="20" height="3" rx="1.5" fill="#2B2440" opacity=".35" />
        <rect x="66" y="86" width="16" height="3" rx="1.5" fill="#2B2440" opacity=".35" />
      </g>
      <g transform="rotate(4 118 82)">
        <rect x="98" y="66" width="40" height="34" rx="4" fill="#FFDCE3" stroke="#2B2440" strokeWidth="1.8" />
        <rect x="104" y="74" width="22" height="3" rx="1.5" fill="#2B2440" opacity=".55" />
        <rect x="104" y="80" width="18" height="3" rx="1.5" fill="#2B2440" opacity=".35" />
        <rect x="104" y="86" width="24" height="3" rx="1.5" fill="#2B2440" opacity=".35" />
      </g>
    </svg>
  );
}

/* Modern — glassmorphisme, cartes translucides avec gloss. */
export function WallOfWishesModernIllustration() {
  return (
    <svg viewBox="0 0 160 120" aria-hidden style={{ width: '100%', height: '100%', display: 'block' }}>
      {/* Halos flous colorés en fond */}
      <ellipse cx="40" cy="30" rx="34" ry="22" fill="#EDE7FF" opacity=".7" />
      <ellipse cx="120" cy="94" rx="34" ry="22" fill="#DAF1FF" opacity=".7" />
      <ellipse cx="140" cy="30" rx="20" ry="14" fill="#FFDCE3" opacity=".55" />

      <circle cx="16" cy="14" r="2" fill="#7C5CFF" />
      <circle cx="148" cy="16" r="2" fill="#5CC8FF" />
      <circle cx="14" cy="106" r="2" fill="#FF5470" />

      {/* Carte 1 */}
      <g>
        <rect x="18" y="28" width="60" height="46" rx="10" fill="#FFFFFF" fillOpacity=".55" stroke="#2B2440" strokeWidth="1.5" />
        <rect x="22" y="32" width="24" height="6" rx="3" fill="#FFFFFF" fillOpacity=".85" />
        <rect x="26" y="46" width="40" height="3" rx="1.5" fill="#2B2440" opacity=".55" />
        <rect x="26" y="54" width="34" height="3" rx="1.5" fill="#2B2440" opacity=".35" />
        <rect x="26" y="62" width="28" height="3" rx="1.5" fill="#2B2440" opacity=".35" />
      </g>

      {/* Carte 2 (par-dessus) */}
      <g transform="translate(4 4)">
        <rect x="56" y="46" width="60" height="46" rx="10" fill="#EDE7FF" fillOpacity=".75" stroke="#2B2440" strokeWidth="1.5" />
        <rect x="60" y="50" width="24" height="6" rx="3" fill="#FFFFFF" fillOpacity=".85" />
        <rect x="64" y="64" width="40" height="3" rx="1.5" fill="#2B2440" opacity=".55" />
        <rect x="64" y="72" width="32" height="3" rx="1.5" fill="#2B2440" opacity=".35" />
        <rect x="64" y="80" width="26" height="3" rx="1.5" fill="#2B2440" opacity=".35" />
      </g>

      {/* Carte 3 */}
      <g>
        <rect x="98" y="28" width="52" height="42" rx="10" fill="#DAF1FF" fillOpacity=".75" stroke="#2B2440" strokeWidth="1.5" />
        <rect x="102" y="32" width="20" height="6" rx="3" fill="#FFFFFF" fillOpacity=".85" />
        <rect x="106" y="46" width="34" height="3" rx="1.5" fill="#2B2440" opacity=".55" />
        <rect x="106" y="54" width="28" height="3" rx="1.5" fill="#2B2440" opacity=".35" />
        <rect x="106" y="62" width="20" height="3" rx="1.5" fill="#2B2440" opacity=".35" />
      </g>
    </svg>
  );
}

/* Craft — moodboard corail, notes épinglées ou scotchées. */
export function WallOfWishesCraftIllustration() {
  return (
    <svg viewBox="0 0 160 120" aria-hidden style={{ width: '100%', height: '100%', display: 'block' }}>
      {/* Pointillés d'ambiance */}
      <circle cx="20" cy="14" r="1.5" fill="#FF9F7A" opacity=".5" />
      <circle cx="60" cy="12" r="1.5" fill="#FF9F7A" opacity=".5" />
      <circle cx="100" cy="16" r="1.5" fill="#FF9F7A" opacity=".5" />
      <circle cx="140" cy="10" r="1.5" fill="#FF9F7A" opacity=".5" />
      <circle cx="20" cy="108" r="1.5" fill="#FF9F7A" opacity=".5" />
      <circle cx="140" cy="108" r="1.5" fill="#FF9F7A" opacity=".5" />

      {/* Note 1 : épinglée */}
      <g transform="rotate(-4 45 44)">
        <rect x="24" y="30" width="42" height="34" rx="1" fill="#FFFFFF" stroke="#2B2440" strokeWidth="1.5" />
        <rect x="30" y="38" width="28" height="3" rx="1" fill="#FF5470" opacity=".7" />
        <rect x="30" y="44" width="22" height="2" rx="1" fill="#2B2440" opacity=".4" />
        <rect x="30" y="50" width="24" height="2" rx="1" fill="#2B2440" opacity=".4" />
        <circle cx="45" cy="28" r="3.5" fill="#FF5470" stroke="#2B2440" strokeWidth="1.2" />
        <circle cx="46.5" cy="26.5" r="1" fill="#FFFFFF" opacity=".8" />
      </g>

      {/* Note 2 : scotchée */}
      <g transform="rotate(3 100 42)">
        <rect x="80" y="28" width="42" height="34" rx="1" fill="#FFF0C9" stroke="#2B2440" strokeWidth="1.5" />
        <rect x="86" y="36" width="28" height="3" rx="1" fill="#FFC145" opacity=".85" />
        <rect x="86" y="42" width="24" height="2" rx="1" fill="#2B2440" opacity=".4" />
        <rect x="86" y="48" width="22" height="2" rx="1" fill="#2B2440" opacity=".4" />
        {/* Scotch */}
        <rect x="94" y="22" width="14" height="7" fill="#FFC145" fillOpacity=".7" stroke="#2B2440" strokeWidth=".6" />
      </g>

      {/* Note 3 : coin plié */}
      <g transform="rotate(-2 118 84)">
        <rect x="100" y="68" width="38" height="34" rx="1" fill="#FFDCE3" stroke="#2B2440" strokeWidth="1.5" />
        <rect x="106" y="76" width="26" height="3" rx="1" fill="#FF9F7A" opacity=".9" />
        <rect x="106" y="82" width="22" height="2" rx="1" fill="#2B2440" opacity=".4" />
        <rect x="106" y="88" width="18" height="2" rx="1" fill="#2B2440" opacity=".4" />
        <path d="M138 102 L138 94 L130 102 z" fill="#F5C6D0" stroke="#2B2440" strokeWidth="1" />
      </g>

      {/* Note 4 : épinglée */}
      <g transform="rotate(4 42 84)">
        <rect x="22" y="68" width="38" height="34" rx="1" fill="#CFF2ED" stroke="#2B2440" strokeWidth="1.5" />
        <rect x="28" y="76" width="26" height="3" rx="1" fill="#00A48D" opacity=".8" />
        <rect x="28" y="82" width="22" height="2" rx="1" fill="#2B2440" opacity=".4" />
        <rect x="28" y="88" width="18" height="2" rx="1" fill="#2B2440" opacity=".4" />
        <circle cx="42" cy="66" r="3" fill="#7C5CFF" stroke="#2B2440" strokeWidth="1.2" />
        <circle cx="43" cy="65" r=".8" fill="#FFFFFF" opacity=".8" />
      </g>
    </svg>
  );
}

/* ══ Map + wrapper ═════════════════════════════════════════════ */

const ILLUSTRATIONS_BY_TEMPLATE = {
  birthday:                 BirthdayIllustration,
  forever:                  ForeverIllustration,
  'notre-film':             NotreFilmIllustration,
  myenvelope:               MyEnvelopeIllustration,
  'wall-of-wishes':         WallOfWishesIllustration,
  'wall-of-wishes-modern':  WallOfWishesModernIllustration,
  'wall-of-wishes-craft':   WallOfWishesCraftIllustration,
};

/* Wrapper : retourne le composant SVG associé au templateName, ou null.
   Utiliser directement les composants nommés si le rendu conditionnel
   n'est pas nécessaire (ex. TemplateStep). */
export function TemplateIllustration({ name, ...props }) {
  const Comp = ILLUSTRATIONS_BY_TEMPLATE[name];
  if (!Comp) return null;
  return <Comp {...props} />;
}

export function hasTemplateIllustration(name) {
  return Boolean(ILLUSTRATIONS_BY_TEMPLATE[name]);
}
