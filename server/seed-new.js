const mongoose = require('mongoose');
const Template = require('./models/Template');

const MONGO_URI = 'mongodb://localhost:27017/wishwell';

async function seedNewTemplates() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const newTemplates = [
    {
      name: 'booklet',
      title: 'Carte Dépliante',
      description: 'Un cahier interactif 3D avec couverture élégante.',
      price: 0,
      active: true,
      category: 'general',
      thumbnail: '/templates/booklet.jpg',
      defaultStyle: {
        primaryColor: '#D4C5B9',
        accentColor: '#F5B544',
        fontFamily: 'Outfit',
      },
      tags: ['nouveau', 'livre', '3d'],
    },
    {
      name: 'envelope',
      title: 'Surprise sous Enveloppe',
      description: 'Une belle enveloppe cachetée de cire qui s\'ouvre au clic.',
      price: 0,
      active: true,
      category: 'general',
      thumbnail: '/templates/envelope.jpg',
      defaultStyle: {
        primaryColor: '#E11D74',
        accentColor: '#F5B544',
        fontFamily: 'Outfit',
      },
      tags: ['nouveau', 'enveloppe', 'animation'],
    }
  ];

  for (const t of newTemplates) {
    await Template.findOneAndUpdate({ name: t.name }, t, { upsert: true, new: true });
    console.log(`Seeded ${t.name}`);
  }

  console.log('Done!');
  process.exit(0);
}

seedNewTemplates().catch(err => {
  console.error(err);
  process.exit(1);
});
