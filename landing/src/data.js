// 1 crédit = 500 FCFA ; on affiche aussi l'équivalent EUR pour la diaspora
const FCFA_TO_EUR = 0.00152;
export const fmtFCFA = (n) => new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';
export const fmtEUR  = (xof) => '≈ ' + (xof * FCFA_TO_EUR).toFixed(xof < 5000 ? 2 : 0).replace('.', ',') + ' €';

export const TEMPLATES = [
  {
    id: 'birthday-classic',
    name: 'Anniversaire',
    sub: 'Le grand classique',
    cat: 'Personnel',
    credits: 8,
    size: 'tall',
    color: 'rose',
    desc: "Confettis, gâteau, photos et musique. Un grand classique qui marche à tous les coups.",
  },
  {
    id: 'wall-of-wishes',
    name: 'Mur de vœux',
    sub: "Collectif · jusqu'à 30",
    cat: 'Collectif',
    credits: 10,
    size: 'sq',
    color: 'gold',
    desc: "Un mur interactif où chaque proche colle son post-it — comme un livre d'or numérique.",
    badge: 'Cagnotte bientôt',
  },
  {
    id: 'mariage-floral',
    name: 'Mariage floral',
    sub: 'Pastel & dorures',
    cat: 'Personnel',
    credits: 12,
    size: 'tall',
    color: 'peach',
    desc: "Pour la demande, le mariage, l'anniversaire de mariage — pastel doux, calligraphie.",
  },
  {
    id: 'baby',
    name: 'Bienvenue',
    sub: 'Naissance · pastel',
    cat: 'Personnel',
    credits: 8,
    size: 'sq',
    color: 'em',
    desc: "Annonce de naissance ou baptême — illustrations rondes, palette douce.",
  },
  {
    id: 'pro-retraite',
    name: 'Départ en retraite',
    sub: 'Hommage collectif',
    cat: 'Pro',
    credits: 20,
    size: 'wide',
    color: 'ink',
    desc: "Signatures de toute l'équipe, photos partagées, mot du dirigeant. Sobre et chaleureux.",
  },
  {
    id: 'tabaski',
    name: 'Tabaski',
    sub: 'Fêtes religieuses',
    cat: 'Personnel',
    credits: 6,
    size: 'sq',
    color: 'gold',
    desc: "Tabaski, Korité, Magal, Noël, Pâques — motifs traditionnels et palette respectueuse.",
  },
  {
    id: 'hommage',
    name: 'Hommage',
    sub: 'In Memoriam',
    cat: 'Personnel',
    credits: 10,
    size: 'tall',
    color: 'em',
    desc: "Sobre, digne, intemporel. Cadres et typographie classique pour honorer un proche.",
  },
  {
    id: 'brand-launch',
    name: 'Vœu de marque',
    sub: 'Campagne saisonnière',
    cat: 'Pro',
    credits: 25,
    size: 'wide',
    color: 'rose',
    desc: "Pour vos clients ou prospects — logo, couleurs, bouton vers votre site ou WhatsApp.",
  },
  {
    id: 'notre-film',
    name: 'Notre film',
    sub: 'Slideshow cinématique',
    cat: 'Personnel',
    credits: 15,
    size: 'sq',
    color: 'ink',
    desc: "Photos et vidéos mixées, transitions cinéma, bande-son personnalisée. Format 16:9.",
  },
];

export const PLANS = [
  {
    name: 'Découverte',
    pitch: 'Pour un premier vœu personnel.',
    credits: 5,  bonus: 0,
    priceXOF: 2500,
    perks: [
      'Tous les templates personnels',
      "Jusqu'à 12 photos par vœu",
      'Partage par lien & QR code',
      'Support par email',
    ],
  },
  {
    name: 'Essentiel',
    pitch: "L'équilibre pour un projet familial.",
    credits: 12, bonus: 2,
    priceXOF: 6000,
    perks: [
      'Tous les templates personnels',
      "Jusqu'à 24 photos par vœu",
      'Musique perso (MP3)',
      "1 vœu collectif jusqu'à 20 personnes",
    ],
  },
  {
    name: 'Pro',
    pitch: 'Pour RH, agences et créateurs réguliers.',
    credits: 30, bonus: 6,
    priceXOF: 15000,
    featured: true,
    perks: [
      'Templates premium & nouveautés',
      'Photos & vidéos illimitées',
      "Vœux collectifs jusqu'à 100 contributeurs",
      'QR aux couleurs de marque',
      'Bouton CTA personnalisé (site, WhatsApp)',
    ],
  },
  {
    name: 'Entreprise',
    pitch: 'Campagnes saisonnières & usages récurrents.',
    credits: 80, bonus: 20,
    priceXOF: 40000,
    perks: [
      'Tout du plan Pro',
      'Vœux collectifs illimités',
      'Sous-domaine & branding complet',
      'Espace multi-utilisateurs',
      'Facturation entreprise',
    ],
  },
];

export const FAQS = [
  {
    q: "Combien coûte réellement un vœu ?",
    a: "1 crédit = 500 FCFA (≈ 0,76 €). Un vœu personnel coûte 5 à 12 crédits, un vœu collectif d'équipe 20 à 30 crédits. Vous voyez le coût exact avant de publier. Pas d'abonnement.",
  },
  {
    q: "Quand est-ce que je paie ?",
    a: "Vous créez un compte gratuit, vous personnalisez librement, et vous achetez des crédits uniquement au moment de publier. La personnalisation est 100% gratuite — vous ne payez jamais avant d'être satisfait.",
  },
  {
    q: "Quels moyens de paiement acceptez-vous ?",
    a: "Wave, Orange Money, MTN Mobile Money, ainsi que Visa / Mastercard pour la diaspora. Le paiement est sécurisé et le tarif s'affiche en FCFA et en EUR.",
  },
  {
    q: "Mes crédits ont-ils une date d'expiration ?",
    a: "Non. Vos crédits restent disponibles tant que votre compte existe. Utilisez-les pour un vœu cette année et pour un autre l'année prochaine — c'est vous qui décidez.",
  },
  {
    q: "Et la cagnotte cadeau, comment ça marche ?",
    a: "C'est notre prochain chantier : sur les vœux collectifs (mariage, départ, anniversaire), chaque contributeur pourra participer à un cadeau commun — une PS5, un voyage, une montre. Le bénéficiaire reçoit le montant directement. Rejoignez la liste d'attente depuis le bandeau du site.",
  },
  {
    q: "Puis-je intégrer ma marque ?",
    a: "Oui. Sur les plans Pro et Entreprise, vous ajoutez votre logo, votre palette et un bouton CTA (votre site, votre boutique, votre WhatsApp). Le QR code peut aussi prendre la forme et les couleurs de votre marque.",
  },
  {
    q: "Combien de temps pour livrer ?",
    a: "Instantané. Une fois la publication confirmée, votre lien et votre QR code sont prêts à partager. Pas de délai, pas d'attente.",
  },
];
