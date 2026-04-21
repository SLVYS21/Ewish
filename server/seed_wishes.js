const API_BASE_URL = 'http://localhost:5000/api/wishes'; 

const PUBLICATION_ID = '64a7b9c9f1a2b3c4d5e6f7g8';

//69e6b7428f20f8c48c2e5cfe
const voeuxCollegue = [
  { firstName: "Mehdi", role: "Collègue de bureau", message: "Joyeux anniv ! 🎂 Sérieusement, je ne sais pas comment j'aurais survécu à la refonte du site sans nos pauses café clandestines de 45 minutes pour refaire le monde ☕🌍. Ne change rien ! 🤜🤛" },
  { firstName: "Alice", role: "Ton binôme", message: "Bon anniversaire mon binôme ! 👯‍♂️ Je me marre encore en repensant au jour où tu as fait 'Répondre à tous' pour critiquer la nouvelle machine à café... au PDG 📧😱. Ta franchise fait du bien à l'équipe ! 😂" },
  { firstName: "Benoît", role: "Support IT", message: "Happy birthday ! 🎈 J'allais t'offrir un cadeau, mais je me suis dit que réinitialiser ton mot de passe sans râler pour la 4ème fois ce mois-ci était une bien plus belle preuve d'amitié 💻🔐. Profite bien de ta journée ! 🎉" },
  { firstName: "Clara", role: "Collègue", message: "Très bel anniversaire ! 🥂 Merci d'être mon regard de détresse officiel pendant les réunions interminables du lundi matin 🙄🆘. C'est fou ce qu'on arrive à se dire sans même ouvrir la bouche. 👀🤐" },
  { firstName: "David", role: "Manager", message: "Joyeux anniversaire ! 🥳 Au-delà de tes excellents résultats 📈, je retiens surtout la fois où tu as organisé un tournoi de Mario Kart en cachette le vendredi aprem pour remonter le moral de l'équipe 🍄🏎️. T'es indispensable. ⭐" },
  { firstName: "Nathalie", role: "La Compta", message: "Un an de plus ! 🎊 Je connais tes notes de frais par cœur 🧾, mais j'ai surtout appris à connaître une personne en or massif 💛. Joyeux anniversaire de la part de toute la compta ! 📊✨" },
  { firstName: "Simon", role: "Collègue", message: "Bon anniv ! 🍻 Mon meilleur souvenir de l'année, c'est définitivement cet afterwork qui a dérapé et où on a fini par manger un kebab à 3h du matin en parlant du sens de la vie 🌯🥙. Hâte de remettre ça ! 🥳" }
];

//69e6b6fd8f20f8c48c2e5cf4
const voeuxMaman = [
  { firstName: "Lucas", role: "Ton fils", message: "Joyeux anniversaire Maman ! ❤️ Même si j'ai 30 ans, je crois que j'aurai toujours besoin de toi pour retrouver mes clés 🔑 (ton radar visuel est un super-pouvoir 🦸‍♀️). Merci pour ta patience infinie. Je t'aime fort. 🥰" },
  { firstName: "Chloé", role: "Ta fille", message: "Bon anniversaire maman chérie. 🎂 Je repense tellement à ces mercredis après-midi où on faisait tes fameux gâteaux au yaourt 🍰 en écoutant tes vieux vinyles 🎶. Tu as rendu mon enfance magique. ✨" },
  { firstName: "Valérie", role: "Ta petite sœur", message: "Un très joyeux anniversaire grande sœur ! 👯‍♀️ Tu te souviens quand on faisait le mur pour aller aux soirées du village et que tu me couvrais auprès de papa ? 🤫 Toujours ma complice préférée ! 💖" },
  { firstName: "Léo", role: "Ton neveu", message: "Joyeux anniversaire Tata ! 🎉 Le Noël où tu t'es déguisée en Père Noël avec une fausse barbe de coton me fait encore mourir de rire 🎅😂. T'es définitivement la tata la plus cool. 😎" },
  { firstName: "Bernard", role: "Beau-frère", message: "Bel anniversaire ! 🥂 Je me souviendrai toujours de mon premier repas dans la famille, où tu as accidentellement fait flamber le rôti 🔥🥩. Tu m'as tout de suite mis à l'aise ! Gros bisous. 😘" },
  { firstName: "Arthur", role: "Ton petit dernier", message: "Maman, merci d'être celle qui a chassé les monstres sous mon lit 👾 et qui, aujourd'hui, écoute mes doutes avec la même bienveillance 🫂. Joyeux anniversaire, tu es mon roc. ⛰️❤️" },
  { firstName: "Sylvie", role: "Ta cousine", message: "Gros bisous pour ton anniversaire ! 💋 Garde ta super énergie... et surtout, garde précieusement la recette de ton tiramisu 🍨, c'est le seul truc qui me fait venir aux repas de famille ! (Je plaisante... à moitié 😉). 🎈" }
];

//69e6b7708f20f8c48c2e5d08
const voeuxAmie = [
  { firstName: "Léa", role: "Ta BFF", message: "Joyeux anniv ma beauté !! 💖 Sérieusement, à chaque fois que je te regarde, je repense à notre road-trip en Espagne 🚗🇪🇸 et à la fois où tu as essayé de parler espagnol au péage... Quelle honte ! 😂 Ne change jamais, je t'aime ! 🥰" },
  { firstName: "Hugo", role: "Pote de fac", message: "Bon anniv ! 🎂 Je me souviendrai toujours de notre première rencontre en amphi, quand tu as renversé ton café sur mes notes ☕📄. Qui aurait cru que 10 ans plus tard, tu serais toujours aussi maladroite, et qu'on serait toujours aussi potes ? 🤜🤛" },
  { firstName: "Camille", role: "Amie", message: "Joyeux anniversaire ! 🥳 J'espère que cette année t'apportera autant de joie que le jour où on a cru voir Ryan Gosling à Paris 🤩 (même si c'était juste un touriste de dos 🤦‍♀️). Gros bisous ! 😘" },
  { firstName: "Thomas", role: "Le fêtard", message: "Happy birthday ! 🪩 J'ai déjà préparé la playlist pour ce soir 🎧. Et oui, j'ai mis du Céline Dion, juste pour que tu puisses nous refaire ta légendaire chorégraphie du Nouvel An 2019 💃🎤. Prépare-toi ! 🥂" },
  { firstName: "Emma", role: "Copine de sport", message: "Joyeux anniversaire ! 🎈 Merci d'être celle qui me motive à aller courir sous la pluie le dimanche matin 🏃‍♀️🌧️, et celle qui me déculpabilise de manger une raclette le dimanche soir 🧀🤤. T'es la meilleure. ❤️" },
  { firstName: "Manon", role: "Amie d'enfance", message: "Ma chérie, depuis l'époque où tu t'étais coupé la frange toute seule en CM1 ✂️👧, on en a fait du chemin ! Je te souhaite tout le bonheur du monde 🌟. Trop hâte de te serrer dans mes bras. 🤗" },
  { firstName: "Julien", role: "Pote", message: "Bon anniversaire !! 🎉 Rappelle-toi : ce qui se passe au karaoké reste au karaoké 🤫🎶. Mais sérieusement, merci d'être toujours là quand j'ai besoin de parler. Passe une journée magique. ✨" }
];

//69e6b7ad8f20f8c48c2e5d12
const voeuxPatron = [
  { firstName: "Paul", role: "Lead Dev", message: "Joyeux anniversaire ! 🎂 Je n'oublierai jamais la fois où le serveur a crashé à 2h du mat' la veille du lancement 💥, et où tu as débarqué avec des pizzas et du café pour toute l'équipe 🍕☕. Merci d'être toujours sur le pont avec nous ! 🚀" },
  { firstName: "Sophie", role: "RH", message: "Très bel anniversaire ! 🎈 Que cette année soit aussi mémorable que ton discours de fin d'année au séminaire... (promis, on ne diffusera pas la vidéo où tu essaies de danser la Macarena 🕺😂). Profite bien ! 🥂" },
  { firstName: "Marc", role: "Sales", message: "Bon anniv boss ! 🎉 Je repense souvent à ce pitch client catastrophique où le rétroprojecteur a pris feu 🔥. Ta façon de retourner la situation avec une blague nous a tous sauvés 😅. T'es un chef ! 👑" },
  { firstName: "Julie", role: "Marketing", message: "Excellente journée d'anniversaire ! 🥳 C'est rare d'avoir un manager qui prend le temps d'écouter les idées farfelues de son équipe 💡. Merci de m'avoir fait confiance sur la campagne de juin dernier, ça a tout changé pour moi. ✨" },
  { firstName: "Antoine", role: "Stagiaire", message: "Joyeux anniversaire ! 🎁 Merci de m'avoir intégré comme un membre à part entière dès mon premier jour, même après que j'ai accidentellement supprimé la base de données de test... Oups ! 🫣💻 Passe une super journée. ☀️" },
  { firstName: "Sarah", role: "Product Owner", message: "Un très bel anniversaire ! 🎊 En cadeau, on a décidé de ne pas te parler de bugs critiques pendant 24 heures 🤫🐛. (Enfin, on va essayer 🤞). Profite à fond de ta journée ! 🍾" },
  { firstName: "Luc", role: "Directeur Financier", message: "Happy birthday ! 🍾 J'espère que tu as prévu un budget conséquent pour fêter ça ce soir 💸😉. Blague à part, c'est un plaisir de construire cette boîte à tes côtés depuis le début. 🤝📈" }
];


async function injectWishes(wishesToInject, publicationId) {
  console.log(`Début de l'injection pour la publication: ${publicationId}`);

  for (const wish of wishesToInject) {
    try {
      const response = await fetch(`${API_BASE_URL}/${publicationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: wish.firstName,
          role: wish.role,
          message: wish.message,
          // photoUrl: "https://example.com/avatar.jpg" // Tu peux ajouter une URL d'avatar par défaut ici si besoin
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`❌ Erreur pour ${wish.firstName}:`, errorData.error);
      } else {
        const data = await response.json();
        console.log(`✅ Vœu ajouté pour ${wish.firstName} (ID: ${data.id})`);
      }
      
      // Petit délai optionnel pour ne pas spammer l'API et simuler un ordre chronologique naturel
      await new Promise(resolve => setTimeout(resolve, 300)); 

    } catch (error) {
      console.error(`🚨 Erreur réseau pour ${wish.firstName}:`, error.message);
    }
  }
  
  console.log('🎉 Injection terminée !');
}

async function seedWishes(){
  await injectWishes(voeuxCollegue, "69e6b7428f20f8c48c2e5cfe");
  await injectWishes(voeuxMaman, "69e6b6fd8f20f8c48c2e5cf4");
  await injectWishes(voeuxAmie, "69e6b7708f20f8c48c2e5d08");
  await injectWishes(voeuxPatron, "69e6b7ad8f20f8c48c2e5d12");
}

seedWishes();