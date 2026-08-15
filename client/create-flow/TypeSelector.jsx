import TileChooser from './TileChooser';

/* ── Illustrations SVG inline — palette Kado (#FF5470 rose, #FFC145 gold,
   #2B2440 ink, #7C5CFF lilac, #00A48D mint, #5CC8FF sky).
   Le sizing (width/height 100%) est appliqué par TileChooser via
   `.illuWrap > svg`, donc les composants d'illustration n'ont pas de classe. ── */

function CardIllustration() {
  return (
    <svg viewBox="0 0 160 120" aria-hidden>
      {/* Confettis en fond */}
      <circle cx="24" cy="18" r="3" fill="#FFC145" />
      <circle cx="140" cy="14" r="2.5" fill="#7C5CFF" />
      <rect x="18" y="98" width="6" height="6" rx="1" fill="#5CC8FF" transform="rotate(20 21 101)" />
      <rect x="138" y="94" width="5" height="5" rx="1" fill="#FF5470" transform="rotate(-15 140 96)" />
      <path d="M132 30 l3 3 -3 3 -3 -3 z" fill="#00A48D" />
      <path d="M28 78 l3 3 -3 3 -3 -3 z" fill="#FFC145" />

      {/* Carte (rectangle) — inclinée */}
      <g transform="rotate(-6 80 62)">
        <rect x="34" y="26" width="92" height="72" rx="10" fill="#FFFFFF" stroke="#2B2440" strokeWidth="2.5" />
        <rect x="44" y="38" width="72" height="10" rx="3" fill="#FF5470" />
        <rect x="44" y="54" width="52" height="4" rx="2" fill="#FFC145" />
        <rect x="44" y="64" width="60" height="4" rx="2" fill="#FFDCE3" />
        <rect x="44" y="74" width="44" height="4" rx="2" fill="#FFDCE3" />
        {/* Note musicale = musique */}
        <path
          d="M96 82 v-14 l10 -3 v14"
          stroke="#2B2440"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <ellipse cx="94" cy="84" rx="4" ry="3" fill="#2B2440" />
        <ellipse cx="104" cy="81" rx="4" ry="3" fill="#2B2440" />
      </g>
    </svg>
  );
}

function WallIllustration() {
  return (
    <svg viewBox="0 0 160 120" aria-hidden>
      {/* Confettis */}
      <circle cx="14" cy="22" r="2.5" fill="#FFC145" />
      <circle cx="148" cy="98" r="2.5" fill="#FF5470" />
      <path d="M144 22 l3 3 -3 3 -3 -3 z" fill="#7C5CFF" />

      {/* Grille de 6 post-its (mur collectif) */}
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

function KadoIllustration() {
  return (
    <svg viewBox="0 0 160 120" aria-hidden>
      {/* Confettis */}
      <circle cx="20" cy="16" r="2.5" fill="#FF5470" />
      <circle cx="140" cy="16" r="2.5" fill="#7C5CFF" />
      <path d="M18 100 l3 3 -3 3 -3 -3 z" fill="#FFC145" />
      <path d="M142 96 l3 3 -3 3 -3 -3 z" fill="#00A48D" />

      {/* Main droite (donneur) */}
      <g transform="translate(20 46)">
        <path
          d="M0 14 C0 8 4 4 10 4 L18 4 L18 24 L10 24 C4 24 0 20 0 14 Z"
          fill="#FFDCE3"
          stroke="#2B2440"
          strokeWidth="1.8"
        />
      </g>

      {/* Main gauche (receveur) */}
      <g transform="translate(122 46)">
        <path
          d="M18 14 C18 8 14 4 8 4 L0 4 L0 24 L8 24 C14 24 18 20 18 14 Z"
          fill="#FFDCE3"
          stroke="#2B2440"
          strokeWidth="1.8"
        />
      </g>

      {/* Pièce (billet) qui se transfère */}
      <g>
        <ellipse cx="80" cy="58" rx="22" ry="22" fill="#FFC145" stroke="#2B2440" strokeWidth="2.5" />
        <ellipse cx="80" cy="58" rx="16" ry="16" fill="none" stroke="#2B2440" strokeWidth="1.5" opacity=".4" />
        {/* Symbole ₣ / F CFA stylisé */}
        <text
          x="80"
          y="66"
          textAnchor="middle"
          fontSize="20"
          fontFamily="'Instrument Serif', Georgia, serif"
          fontWeight="700"
          fill="#2B2440"
        >F</text>
      </g>

      {/* Flèche de transfert (indice mouvement) */}
      <path
        d="M50 30 q30 -14 60 0"
        fill="none"
        stroke="#7C5CFF"
        strokeWidth="2"
        strokeDasharray="3 3"
        strokeLinecap="round"
      />
      <path d="M108 30 l4 -3 -1 5 z" fill="#7C5CFF" />

      {/* Petits éclats étincelants autour de la pièce */}
      <path d="M60 44 l1.5 3 3 -0.5 -2 2 1 3 -3 -1.5 -2.5 2 0.5 -3 -2 -1.5 3 -0.5 z" fill="#FF5470" opacity=".9" />
      <path d="M104 78 l1 2 2.5 -0.5 -1.5 1.8 0.5 2.2 -2.2 -1 -1.5 1.5 0 -2.2 -1.5 -1 2.2 -0.3 z" fill="#5CC8FF" opacity=".9" />
    </svg>
  );
}

function EnvelopeIllustration() {
  return (
    <svg viewBox="0 0 160 120" aria-hidden>
      {/* Confettis autour */}
      <circle cx="18" cy="20" r="2.5" fill="#7C5CFF" />
      <circle cx="144" cy="20" r="2.5" fill="#00A48D" />
      <path d="M148 96 l3 3 -3 3 -3 -3 z" fill="#FFC145" />
      <rect x="12" y="94" width="5" height="5" rx="1" fill="#FF5470" transform="rotate(20 15 96)" />

      {/* Cadeau qui sort de l'enveloppe */}
      <g transform="translate(60 14)">
        <rect x="0" y="0" width="40" height="34" rx="3" fill="#FFC145" stroke="#2B2440" strokeWidth="2" />
        <rect x="17" y="0" width="6" height="34" fill="#FF5470" stroke="#2B2440" strokeWidth="2" />
        <path
          d="M20 -2 c-6 -8 -14 -4 -10 4 c1 3 6 4 10 2 c4 2 9 1 10 -2 c4 -8 -4 -12 -10 -4 z"
          fill="#FF5470"
          stroke="#2B2440"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </g>

      {/* Enveloppe (corps) */}
      <g>
        <path
          d="M22 52 h116 a4 4 0 0 1 4 4 v42 a4 4 0 0 1 -4 4 h-116 a4 4 0 0 1 -4 -4 v-42 a4 4 0 0 1 4 -4 z"
          fill="#FFF3F5"
          stroke="#2B2440"
          strokeWidth="2.5"
        />
        <path
          d="M18 52 L80 88 L142 52"
          fill="none"
          stroke="#2B2440"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <ellipse cx="80" cy="52" rx="18" ry="3" fill="#2B2440" opacity=".08" />
      </g>
    </svg>
  );
}

/* Ordre : universel → personnel. On commence par l'enveloppe (usage large,
   couple/équipe/famille), puis la carte (unique et dédiée à une personne),
   puis le mur (collectif à plusieurs voix), puis le kado (bientôt). */
const TYPES = [
  {
    id: 'envelope',
    title: 'Une enveloppe',
    description: 'Universelle et rapide — mariage, félicitations, remerciement. Avec cadeau intégré.',
    Illustration: EnvelopeIllustration,
    accent: 'butter',
  },
  {
    id: 'wish',
    title: 'Une carte',
    description: 'Personnelle et dédiée — un moment rien qu\'à cette personne, avec musique et photos.',
    Illustration: CardIllustration,
    accent: 'rose',
  },
  {
    id: 'wall',
    title: 'Un mur',
    description: 'Collectif — plusieurs voix, un seul mur. À plusieurs mains.',
    Illustration: WallIllustration,
    accent: 'lilac',
  },
  {
    id: 'kado',
    title: 'Un kado',
    description: 'Envoyer de l\'argent, sans carte.',
    Illustration: KadoIllustration,
    accent: 'mint',
    badge: 'Bientôt',
    disabled: true,
  },
];

export default function TypeSelector({ onSelect, onBack }) {
  return (
    <TileChooser
      tiles={TYPES}
      title="Tu veux créer quoi ?"
      subtitle="Choisis pour bien commencer."
      ariaLabel="Types de création"
      onSelect={onSelect}
      onBack={onBack}
      desktopColumns={4}
      mobileLayout="grid"
    />
  );
}
