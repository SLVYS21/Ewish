#!/usr/bin/env node
/* ────────────────────────────────────────────────────────────────────
   Migration : data.kind='myenvelope' → champs plats typés.

   Convertit toutes les Publication où templateName='myenvelope' :
     data.occasionId       → envelopeOccasion
     data.themeId          + data.envelopeColor
       + data.envelopeTexture + data.linerChoice → envelopeTheme.*
     data.texts            → envelopeTexts (+ subtitle → recipient)
     data.photo            → envelopePhoto
     data.gift             → envelopeGift
     data.confettiStyle    → envelopeConfetti
     data.unboxingBg       → envelopeUnboxingBg

   Idempotent : ne re-migre pas si envelopeTheme.id est déjà set.
   Garde data en backup (n'est pas supprimé) pour rollback éventuel.

   Usage :
     node server/scripts/migrate-myenvelope.js            # dry-run (défaut)
     node server/scripts/migrate-myenvelope.js --apply    # exécute
     MONGO_URI=... node server/scripts/migrate-myenvelope.js --apply
   ──────────────────────────────────────────────────────────────────── */

require('dotenv').config();
const mongoose = require('mongoose');
const Publication = require('../models/Publication');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wishwell';
const APPLY = process.argv.includes('--apply');

function buildEnvelopeFields(pub) {
  const d = pub.data || {};
  const texts = d.texts || {};

  const envelopeTheme = {
    id:      d.themeId || 'floral',
    color:   d.envelopeColor || '',
    texture: ['smooth', 'linen', 'kraft', 'satin'].includes(d.envelopeTexture)
      ? d.envelopeTexture
      : 'linen',
    liner:   d.linerChoice || 'theme',
  };

  const envelopeTexts = {
    title:        texts.title        || '',
    recipient:    texts.subtitle     || d.recipient || '',
    photoCaption: texts.photoCaption || '',
    message:      texts.message      || '',
    signature:    texts.signature    || '',
    backNote:     texts.backNote     || '',
  };

  const envelopeGift = d.gift ? {
    enabled:  !!d.gift.enabled,
    amount:   Number(d.gift.amount) || 0,
    currency: d.gift.currency || 'XOF',
    message:  d.gift.message  || '',
  } : { enabled: false, amount: 0, currency: 'XOF', message: '' };

  return {
    envelopeOccasion:   d.occasionId || 'birthday',
    envelopeTheme,
    envelopeTexts,
    envelopePhoto:      d.photo || '',
    envelopeGift,
    envelopeConfetti:   d.confettiStyle || 'default',
    envelopeUnboxingBg: d.unboxingBg    || 'default',
  };
}

async function main() {
  console.log(`\n[migrate-myenvelope] mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}`);
  console.log(`[migrate-myenvelope] mongo: ${MONGO_URI.replace(/\/\/([^:]+):[^@]+@/, '//$1:***@')}\n`);

  await mongoose.connect(MONGO_URI);

  const cursor = Publication.find({ templateName: 'myenvelope' }).cursor();
  let total = 0, migrated = 0, skipped = 0, failed = 0;

  for (let pub = await cursor.next(); pub != null; pub = await cursor.next()) {
    total++;
    try {
      // Idempotence : si envelopeTheme.id est set et != défaut vide, considère migré.
      const alreadyMigrated = pub.envelopeTheme
        && pub.envelopeTheme.id
        && (pub.envelopeTexts?.message || pub.envelopeTexts?.title || pub.envelopeTexts?.recipient);
      if (alreadyMigrated) {
        skipped++;
        continue;
      }

      const fields = buildEnvelopeFields(pub);

      if (APPLY) {
        Object.assign(pub, fields);
        await pub.save();
      } else {
        console.log(`  [${pub._id}] "${pub.title}" → `, {
          occasion: fields.envelopeOccasion,
          theme:    fields.envelopeTheme.id,
          recipient: fields.envelopeTexts.recipient,
          gift:     fields.envelopeGift.enabled ? `${fields.envelopeGift.amount} ${fields.envelopeGift.currency}` : 'none',
        });
      }
      migrated++;
    } catch (err) {
      failed++;
      console.error(`  [${pub._id}] FAILED:`, err.message);
    }
  }

  console.log(`\n[migrate-myenvelope] done.`);
  console.log(`  total:    ${total}`);
  console.log(`  migrated: ${migrated}${APPLY ? '' : ' (dry-run, no writes)'}`);
  console.log(`  skipped:  ${skipped} (already migrated)`);
  console.log(`  failed:   ${failed}`);

  if (!APPLY && migrated > 0) {
    console.log(`\n  → Re-run with --apply to persist changes.`);
  }

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('[migrate-myenvelope] fatal:', err);
  process.exit(1);
});
