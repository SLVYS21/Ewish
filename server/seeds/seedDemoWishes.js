const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Publication = require('../models/Publication');
const Wish = require('../models/Wish');

const WALL_THEMES = {
  'demo-anniversaire-groupe': [
    { firstName: 'Julie', message: "Joyeux anniversaire ma belle ! 30 ans, ça se fête en grand 🎂", mediaType: 'sticker' },
    { firstName: 'Max', message: "Profite de cette journée, tu le mérites tellement ! Bisous", mediaType: 'none' },
    { firstName: 'Sophie', role: 'Collègue', message: "Joyeux 30 ans Léa ! Hâte de fêter ça avec toi ce week-end 🎉", mediaType: 'sticker' },
    { firstName: 'Maman', message: "Ma chérie, je te souhaite le plus merveilleux des anniversaires. Je suis si fière de toi.", mediaType: 'none' },
    { firstName: 'Thomas', message: "Happy thirty ! Que cette nouvelle décennie soit incroyable.", mediaType: 'sticker' },
    { firstName: 'Papa', message: "Mon grand bébé a 30 ans... Le temps passe si vite. Je t'aime fort.", mediaType: 'none' },
    { firstName: 'Céline', role: 'BFF', message: "À la meilleure amie du monde !!! Prépare-toi pour samedi, on va tout casser 🍾", mediaType: 'sticker' },
    { firstName: 'Marc', role: 'Frérot', message: "Bon anniv la vieille ! T'inquiète pas, les rides ça te va bien 😂", mediaType: 'sticker' },
    { firstName: 'Antoine', message: "Une très belle journée d'anniversaire Léa. Que cette année t'apporte de belles surprises.", mediaType: 'none' },
    { firstName: 'Nadia', message: "30 ans d'élégance ! Reste comme tu es, tu es parfaite.", mediaType: 'sticker' },
    { firstName: 'Lucas', message: "Encore un anniversaire ensemble ! C'est parti pour le show 🎸", mediaType: 'sticker' },
    { firstName: 'Tatie Véro', message: "Gros bisous ma chérie pour tes 30 printemps. Profite bien de la famille.", mediaType: 'none' },
    { firstName: 'Hugo', message: "Joyeux anniversaire boss ! Le bureau est trop calme sans toi aujourd'hui.", mediaType: 'sticker' }
  ],
  'demo-mariage-groupe': [
    { firstName: 'Claire & Paul', message: "Toutes nos félicitations ! Que votre vie soit remplie d'amour et de rires.", mediaType: 'sticker' },
    { firstName: 'Tata Josiane', message: "Mon Dieu que vous êtes beaux. Plein de bonheur à vous deux !", mediaType: 'none' },
    { firstName: 'Antoine', message: "Bravo les amoureux ! Hâte de danser à votre mariage.", mediaType: 'sticker' },
    { firstName: 'Marie', role: 'Témoin', message: "Sarah, tu vas être la plus belle des mariées ! Je vous aime fort ❤️", mediaType: 'none' },
    { firstName: 'Guillaume', role: 'Témoin', message: "Prends soin d'elle Marc, sinon je débarque ! Superbe cérémonie.", mediaType: 'sticker' },
    { firstName: 'Léa', message: "Vous formez le couple parfait. Longue vie à votre amour !", mediaType: 'sticker' },
    { firstName: 'Oncle Bernard', message: "Vive les mariés ! Et vive le champagne 🥂", mediaType: 'none' },
    { firstName: 'Camille', message: "Une journée inoubliable pour un couple inoubliable. Merci pour tout.", mediaType: 'sticker' },
    { firstName: 'Alexandre', message: "Que ce OUI soit le début d'une aventure extraordinaire.", mediaType: 'none' },
    { firstName: 'Famille Dupont', message: "Tous nos vœux de bonheur. Profitez bien de votre lune de miel au soleil ☀️", mediaType: 'sticker' },
    { firstName: 'Juliette', message: "J'ai failli pleurer à la mairie. Soyez heureux !", mediaType: 'none' },
    { firstName: 'Romain', message: "Magnifique fête. Félicitations pour cette belle étape de vie.", mediaType: 'sticker' },
    { firstName: 'Maman de Sarah', message: "Ma fille d'amour et mon nouveau fils. Mon cœur déborde de joie.", mediaType: 'none' },
    { firstName: 'Papa de Marc', message: "Fier de l'homme que tu es devenu. Sarah, bienvenue dans la famille.", mediaType: 'none' }
  ],
  'demo-deces-groupe': [
    { firstName: 'Famille Martin', message: "Toutes nos pensées vous accompagnent dans cette épreuve. Gabriel restera dans nos cœurs.", mediaType: 'none' },
    { firstName: 'Jean', message: "Tu vas nous manquer vieux frère. Repose en paix.", mediaType: 'none' },
    { firstName: 'Alice', message: "Je garde le souvenir d'un homme généreux et toujours souriant. Courage à la famille.", mediaType: 'none' },
    { firstName: 'Lucie', message: "Une belle âme s'est envolée. Toutes mes condoléances.", mediaType: 'sticker' },
    { firstName: 'Patrick', role: 'Collègue', message: "Travailler avec toi fut un privilège. Ton humour nous manquera.", mediaType: 'none' },
    { firstName: 'Monique', message: "Nous partageons votre immense chagrin. Nos pensées les plus douces.", mediaType: 'sticker' },
    { firstName: 'Sylvain', message: "Les bons souvenirs restent à jamais. Merci pour ton amitié sincère.", mediaType: 'none' },
    { firstName: 'Céline', message: "Je n'oublierai jamais nos discussions passionnées. Repose en paix Gaby.", mediaType: 'none' },
    { firstName: 'Marc', message: "Un homme d'une grande valeur nous quitte. Force et courage à vous.", mediaType: 'sticker' },
    { firstName: 'Sophie', message: "Il y a des vides qu'on ne comble jamais, mais l'amour demeure éternellement.", mediaType: 'none' },
    { firstName: 'Thomas', message: "À notre ami de toujours, on gardera ton rire en mémoire.", mediaType: 'none' },
    { firstName: 'Hélène', message: "Sincères condoléances de la part de toute l'équipe.", mediaType: 'sticker' },
    { firstName: 'Nicolas', message: "Il continuera de veiller sur vous, de là-haut. Courage.", mediaType: 'none' }
  ],
  'demo-soiree-groupe': [
    { firstName: 'Julien', message: "Encore merci pour cette soirée mémorable ! On a bien rigolé 😂", mediaType: 'sticker' },
    { firstName: 'Chloé', message: "La prochaine chez moi ! Super ambiance comme toujours.", mediaType: 'none' },
    { firstName: 'Alex', message: "Meilleure soirée de l'année. Je m'en remets toujours pas de la danse de Léo !", mediaType: 'sticker' },
    { firstName: 'Nadia', message: "Trop bien rentrée. Merci pour l'invit et à très vite les gars !!", mediaType: 'none' },
    { firstName: 'Léo', message: "Je renie cette vidéo de moi qui danse. Mais super soirée ! 🕺", mediaType: 'sticker' },
    { firstName: 'Mélanie', message: "Le karaoké était légendaire. Vous chantez tous terriblement faux.", mediaType: 'sticker' },
    { firstName: 'Sam', message: "Quelqu'un a retrouvé ma veste ? Sinon soirée au top !", mediaType: 'none' },
    { firstName: 'Hugo', message: "Le cocktail secret de Max m'a mis KO. A refaire d'urgence !", mediaType: 'sticker' },
    { firstName: 'Carole', message: "La déco était folle, la musique géniale. 10/10.", mediaType: 'none' },
    { firstName: 'Bastien', message: "Merci pour les pizzas de fin de soirée, elles m'ont sauvé la vie 🍕", mediaType: 'sticker' },
    { firstName: 'Nina', message: "Je me réveille à peine. C'était ouf. Merci !!", mediaType: 'none' },
    { firstName: 'Victor', message: "Trop bien de revoir tout le monde, ça faisait si longtemps.", mediaType: 'sticker' },
    { firstName: 'Jules', message: "Prêt pour la revanche au Mario Kart quand vous voulez 🏎️", mediaType: 'sticker' }
  ],
  'demo-naissance-groupe': [
    { firstName: 'Léa', message: "Bienvenue au petit Noah ! Hâte de voir sa petite bouille.", mediaType: 'sticker' },
    { firstName: 'Mamie', message: "Mon petit-fils chéri, bienvenue dans la famille. Je t'aime déjà si fort.", mediaType: 'none' },
    { firstName: 'Lucas', message: "Félicitations aux parents ! Préparez-vous aux nuits blanches 😉", mediaType: 'sticker' },
    { firstName: 'Emma', message: "Bravo pour cette merveille ! Hâte de le rencontrer.", mediaType: 'none' },
    { firstName: 'Papy', message: "Un futur champion est né ! On est tellement fiers.", mediaType: 'sticker' },
    { firstName: 'Sophie', role: 'Marraine', message: "Mon filleul d'amour ! Je vais te gâter, c'est promis 🧸", mediaType: 'sticker' },
    { firstName: 'Arthur', role: 'Parrain', message: "Bienvenue Noah. Compte sur moi pour t'apprendre les bêtises.", mediaType: 'none' },
    { firstName: 'Camille', message: "Il a les yeux de sa maman ! Toutes nos félicitations.", mediaType: 'sticker' },
    { firstName: 'Jérôme', message: "Beaucoup de bonheur à vous trois dans cette nouvelle aventure.", mediaType: 'none' },
    { firstName: 'Sarah', message: "Un bébé si attendu, tellement heureuse pour vous les amis !", mediaType: 'sticker' },
    { firstName: 'Marie', message: "Profitez de chaque instant, ça grandit trop vite ❤️", mediaType: 'none' },
    { firstName: 'Tonton Paul', message: "Le plus beau des bébés ! Hâte de lui faire son premier cadeau.", mediaType: 'sticker' },
    { firstName: 'Cécile', message: "Plein de tendresse et de gros câlins à Noah.", mediaType: 'none' }
  ],
  'demo-felicitations-groupe': [
    { firstName: 'Marc', role: 'Directeur', message: "Un immense bravo à toute l'équipe pour ce projet. Superbe travail ! 👏", mediaType: 'sticker' },
    { firstName: 'Sarah', message: "On l'a fait !! Fière de faire partie de cette équipe incroyable.", mediaType: 'none' },
    { firstName: 'Kevin', message: "Beaucoup d'efforts récompensés. Allez on célèbre ça !", mediaType: 'sticker' },
    { firstName: 'Directeur Général', message: "Vos résultats sont exceptionnels. Merci pour votre engagement sans faille.", mediaType: 'none' },
    { firstName: 'Julie', role: 'Marketing', message: "Quel lancement de folie. On a déchiré les objectifs !", mediaType: 'sticker' },
    { firstName: 'Thomas', role: 'Dev', message: "Le code tourne en prod sans bug, je suis refait. Bravo la team.", mediaType: 'sticker' },
    { firstName: 'Amélie', message: "Merci à tous pour la collaboration fluide. C'était un plaisir.", mediaType: 'none' },
    { firstName: 'David', role: 'Client', message: "Produit livré à temps et au-delà des attentes. Félicitations à vous tous.", mediaType: 'sticker' },
    { firstName: 'Lucie', message: "J'ai apporté les croissants ce matin pour fêter ça ! 🥐", mediaType: 'sticker' },
    { firstName: 'Benoit', message: "Une étape franchie avec brio. En route pour le prochain challenge !", mediaType: 'none' },
    { firstName: 'Nadia', message: "On peut enfin respirer ! Quel marathon, bravo à tous.", mediaType: 'sticker' },
    { firstName: 'Paul', message: "C'est grâce à notre esprit d'équipe qu'on en est là. Cheers 🥂", mediaType: 'none' },
    { firstName: 'Clara', message: "Des mois de boulot et le résultat est là. Tellement fière.", mediaType: 'sticker' }
  ],
  'demo-vision-board': [
    { firstName: 'Moi', message: "Voyager au Japon au printemps 2027 🌸", mediaType: 'sticker' },
    { firstName: 'Inspi', message: "Rien n'est impossible, il suffit d'y croire.", mediaType: 'none' },
    { firstName: 'Rappel', message: "Boire 2 litres d'eau par jour 💧", mediaType: 'sticker' },
    { firstName: 'Moi', message: "Lancer mon podcast avant juin !", mediaType: 'none' },
    { firstName: 'Goal', message: "Lire 1 livre par mois cette année 📚", mediaType: 'sticker' },
    { firstName: 'Mantra', message: "Fais de ton mieux, c'est déjà énorme.", mediaType: 'none' },
    { firstName: 'Santé', message: "Yoga au moins 2 fois par semaine 🧘‍♀️", mediaType: 'sticker' },
    { firstName: 'Carrière', message: "Apprendre React et faire mon premier side-project.", mediaType: 'sticker' },
    { firstName: 'Finances', message: "Mettre de côté pour m'acheter mon propre appart 🏡", mediaType: 'none' },
    { firstName: 'Mindset', message: "La perfection est l'ennemi du bien.", mediaType: 'none' },
    { firstName: 'Voyage', message: "Faire un roadtrip en van le long de la côte Ouest.", mediaType: 'sticker' },
    { firstName: 'Loisir', message: "Prendre des cours de poterie cet hiver 🏺", mediaType: 'sticker' },
    { firstName: 'Famille', message: "Appeler les grands-parents tous les dimanches.", mediaType: 'none' },
    { firstName: 'Détox', message: "Moins de temps sur les réseaux, plus de temps dehors 🌲", mediaType: 'sticker' }
  ]
};

async function seedWishes() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/wishwell');
  console.log('✓ Connecté à MongoDB');

  // Load stickers
  const stickersDir = path.join(__dirname, '../public/stickers');
  let stickers = [];
  try {
    stickers = fs.readdirSync(stickersDir).filter(f => f.endsWith('.webp') || f.endsWith('.png'));
  } catch (err) {
    console.log('⚠ Impossible de lire le dossier stickers :', err.message);
  }

  const publications = await Publication.find({ customName: { $in: Object.keys(WALL_THEMES) } });

  if (!publications.length) {
    console.log('⚠ Aucune publication de démo trouvée. Lancez seedDemoLanding.js d\'abord.');
    process.exit(1);
  }

  for (const pub of publications) {
    console.log(`\n── Traitement du mur : ${pub.customName} ──`);
    
    // Supprimer les voeux existants pour cette publication
    const deleteRes = await Wish.deleteMany({ publicationId: pub._id });
    console.log(`  - Supprimé ${deleteRes.deletedCount} voeux existants.`);

    const themeWishes = WALL_THEMES[pub.customName];
    if (!themeWishes) continue;

    for (let i = 0; i < themeWishes.length; i++) {
      const wData = themeWishes[i];
      const payload = {
        publicationId: pub._id,
        firstName: wData.firstName,
        role: wData.role || '',
        message: wData.message,
        approved: true, // Approuvé d'office
        color: Math.floor(Math.random() * 6),
        rot: Math.floor(Math.random() * 6) - 3, // Légère rotation aléatoire -3 to +3
        mediaType: wData.mediaType
      };

      if (wData.mediaType === 'sticker' && stickers.length > 0) {
        const randomSticker = stickers[Math.floor(Math.random() * stickers.length)];
        payload.photoUrl = `/stickers/${randomSticker}`;
      }

      await Wish.create(payload);
      console.log(`  + Ajouté vœu de ${wData.firstName}`);
    }
  }

  await mongoose.disconnect();
  console.log('\n✓ Terminé avec succès.');
}

seedWishes().catch(e => {
  console.error(e);
  process.exit(1);
});
