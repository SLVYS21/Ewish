// -----------------------------------------------------------------------------
// Occasion catalog. Each entry carries a suggested title AND message so the
// content wizard can pre-fill sensible defaults, updated live when the
// occasion changes (unless the user has already customised those fields).
// -----------------------------------------------------------------------------

export const OCCASIONS = [
  {
    id: 'anniversaire', label: 'Anniversaire', icon: 'cake',
    title: 'Joyeux Anniversaire',
    message: "Que cette année t'apporte joie, rires et beaux souvenirs. Que chacun de tes rêves se réalise. Passe une magnifique journée entouré·e de ceux que tu aimes.",
  },
  {
    id: 'mariage', label: 'Mariage', icon: 'heart',
    title: 'Toutes nos félicitations',
    message: "En ce jour si particulier, nous vous souhaitons une vie remplie d'amour, de complicité et de moments inoubliables. Que votre union soit aussi belle que votre histoire.",
  },
  {
    id: 'naissance', label: 'Naissance', icon: 'baby',
    title: 'Bienvenue au monde',
    message: "Toutes nos félicitations pour cette merveilleuse nouvelle. Nous vous souhaitons plein de bonheur, de douceur et de tendres instants avec ce petit trésor.",
  },
  {
    id: 'merci', label: 'Remerciement', icon: 'thumbs-up',
    title: 'Merci',
    message: "Un immense merci du fond du cœur. Votre geste, votre présence, votre soutien comptent énormément pour nous. Merci d'être là.",
  },
  {
    id: 'felicitations', label: 'Félicitations', icon: 'party-popper',
    title: 'Félicitations',
    message: "Bravo pour cette belle réussite ! Elle est méritée et nous sommes très fiers de toi. Continue à briller et à croire en toi.",
  },
  {
    id: 'retablissement', label: 'Bon rétablissement', icon: 'flower',
    title: 'Bon rétablissement',
    message: "Prends soin de toi et repose-toi bien. On pense fort à toi et on t'envoie plein d'ondes positives pour que tu retrouves vite la forme.",
  },
  {
    id: 'fete_mere', label: 'Fête des mères', icon: 'flower',
    title: 'Bonne fête Maman',
    message: "Merci pour ton amour inconditionnel, ta patience, ta bienveillance. Tu es et tu resteras la meilleure des mamans. Je t'aime plus que tout.",
  },
  {
    id: 'fete_pere', label: 'Fête des pères', icon: 'heart',
    title: 'Bonne fête Papa',
    message: "Merci d'être toujours là, pour tes conseils, ton humour, ton exemple. Tu es un papa formidable et j'ai beaucoup de chance de t'avoir. Je t'aime.",
  },
  {
    id: 'saint_valentin', label: 'Saint-Valentin', icon: 'heart',
    title: "Je t'aime",
    message: "Chaque jour à tes côtés est un cadeau. Merci d'être toi, merci d'être là. Mon cœur t'appartient, aujourd'hui comme toujours.",
  },
  {
    id: 'noel', label: 'Noël', icon: 'gift',
    title: 'Joyeux Noël',
    message: "Que la magie de Noël illumine ta soirée, que la chaleur des tiens réchauffe ton cœur et que cette fin d'année soit douce et joyeuse.",
  },
  {
    id: 'nouvel_an', label: 'Nouvel An', icon: 'sparkles',
    title: 'Bonne Année',
    message: "Que cette nouvelle année t'apporte santé, bonheur, réussite et de merveilleux souvenirs à créer. Excellente année à toi et à tes proches.",
  },
  {
    id: 'bapteme', label: 'Baptême', icon: 'flower',
    title: 'Bénédictions',
    message: "En ce jour sacré, nous te souhaitons une vie remplie de foi, d'amour et de belles rencontres. Sois toujours guidé·e sur le chemin du bonheur.",
  },
  {
    id: 'communion', label: 'Communion', icon: 'flower',
    title: 'Bénédictions',
    message: "En ce jour si important, nous partageons ta joie et t'envoyons toutes nos pensées les plus douces. Que cette étape marque le début d'un beau chemin.",
  },
  {
    id: 'retraite', label: 'Départ à la retraite', icon: 'sun',
    title: 'Bonne retraite',
    message: "Après toutes ces années, tu mérites amplement de profiter pleinement de ce nouveau chapitre. Nous te souhaitons une retraite douce, active et heureuse.",
  },
  {
    id: 'condoleances', label: 'Condoléances', icon: 'flower',
    title: 'Sincères condoléances',
    message: "Dans ce moment difficile, nous pensons très fort à toi et à ta famille. Reçois nos sincères condoléances et notre affectueux soutien.",
  },
  {
    id: 'autre', label: 'Autre', icon: 'star',
    title: '',
    message: '',
  },
];

export const DEFAULT_OCCASION_ID = 'anniversaire';

export const findOccasion = (id) => OCCASIONS.find(o => o.id === id) || OCCASIONS[0];
