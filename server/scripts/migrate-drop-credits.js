#!/usr/bin/env node
/* ────────────────────────────────────────────────────────────────────
   Migration : suppression du système de crédits (reset sec).

   - Template.creditsRequired → priceFCFA (creditsRequired × 500)
   - AdminUser.credits         → dropped
   - Promo.isCreditGift/creditAmount → soft-disable des cadeaux crédits
     (active=false), on ne supprime pas pour garder l'historique.
   - Transaction.credits       → dropped (les transactions existantes
     restent en base, seul le champ est retiré).

   Idempotent : re-run sans effet une fois exécuté.

   Usage :
     node server/scripts/migrate-drop-credits.js            # dry-run (défaut)
     node server/scripts/migrate-drop-credits.js --apply    # exécute
     MONGO_URI=... node server/scripts/migrate-drop-credits.js --apply
   ──────────────────────────────────────────────────────────────────── */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wishwell';
const APPLY = process.argv.includes('--apply');

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log(`[migrate-drop-credits] Connected. Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}`);

  const db = mongoose.connection.db;

  /* 1. Templates : creditsRequired × 500 → priceFCFA */
  const templatesToMigrate = await db.collection('templates')
    .countDocuments({ creditsRequired: { $exists: true } });
  console.log(`[templates] ${templatesToMigrate} document(s) à migrer (creditsRequired → priceFCFA)`);

  if (APPLY && templatesToMigrate > 0) {
    const res = await db.collection('templates').updateMany(
      { creditsRequired: { $exists: true } },
      [
        { $set: { priceFCFA: { $multiply: [{ $ifNull: ['$creditsRequired', 1] }, 500] } } },
        { $unset: 'creditsRequired' },
      ]
    );
    console.log(`[templates] modifiés : ${res.modifiedCount}`);
  }

  /* 2. AdminUser : drop credits */
  const usersWithCredits = await db.collection('adminusers')
    .countDocuments({ credits: { $exists: true } });
  console.log(`[adminusers] ${usersWithCredits} document(s) avec un champ credits à drop`);

  if (APPLY && usersWithCredits > 0) {
    const res = await db.collection('adminusers').updateMany(
      { credits: { $exists: true } },
      { $unset: { credits: '' } }
    );
    console.log(`[adminusers] modifiés : ${res.modifiedCount}`);
  }

  /* 3. Promo : soft-disable des cadeaux crédits + drop des champs gift */
  const giftPromos = await db.collection('promos')
    .countDocuments({ isCreditGift: true });
  console.log(`[promos] ${giftPromos} cadeau(x) crédits à désactiver`);

  if (APPLY && giftPromos > 0) {
    const res1 = await db.collection('promos').updateMany(
      { isCreditGift: true },
      { $set: { active: false } }
    );
    console.log(`[promos] désactivés : ${res1.modifiedCount}`);
  }

  const promosWithGiftFields = await db.collection('promos')
    .countDocuments({ $or: [{ isCreditGift: { $exists: true } }, { creditAmount: { $exists: true } }] });
  console.log(`[promos] ${promosWithGiftFields} document(s) avec des champs gift à drop`);

  if (APPLY && promosWithGiftFields > 0) {
    const res2 = await db.collection('promos').updateMany(
      {},
      { $unset: { isCreditGift: '', creditAmount: '' } }
    );
    console.log(`[promos] modifiés : ${res2.modifiedCount}`);
  }

  /* 4. Transaction : drop credits (historique conservé) */
  const txWithCredits = await db.collection('transactions')
    .countDocuments({ credits: { $exists: true } });
  console.log(`[transactions] ${txWithCredits} document(s) avec un champ credits à drop`);

  if (APPLY && txWithCredits > 0) {
    const res = await db.collection('transactions').updateMany(
      { credits: { $exists: true } },
      { $unset: { credits: '' } }
    );
    console.log(`[transactions] modifiés : ${res.modifiedCount}`);
  }

  if (!APPLY) {
    console.log('\n[migrate-drop-credits] DRY-RUN terminé. Relance avec --apply pour appliquer.');
  } else {
    console.log('\n[migrate-drop-credits] Migration terminée.');
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('[migrate-drop-credits] Erreur :', err);
  process.exit(1);
});
