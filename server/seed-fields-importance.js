require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const Template = require('./models/Template');

const PRIMARY_KEYS = new Set([
  'name', 'titleName', 'subtitle', 'message', 'textInChatBox',
  'imagePath', 'photo1', 'photo2', 'albumArt',
  'musicSrc', 'musicStartTime', 'trackTitle', 'trackArtist',
  'wishHeading', 'wishText', 'wish1', 'wish2', 'wish3',
  'groupName', 'groupMessage', 'carouselTitle',
]);

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB');

    const templates = await Template.find();
    let updatedCount = 0;

    for (const template of templates) {
      let changed = false;
      
      for (const field of template.fields) {
        const isPrimary = PRIMARY_KEYS.has(field.key);
        const importance = isPrimary ? 'primary' : 'secondary';
        
        if (field.importance !== importance) {
          field.importance = importance;
          changed = true;
        }
      }

      if (changed) {
        await template.save();
        updatedCount++;
        console.log(`✓ Updated importance for fields in template: ${template.name}`);
      }
    }

    console.log(`\nDone! Updated ${updatedCount} templates.`);
  } catch (err) {
    console.error('Error seeding templates:', err);
  } finally {
    mongoose.disconnect();
  }
}

seed();
