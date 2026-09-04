/* ================================================================
   myKado — UserDate model
   Dates importantes enregistrées par un utilisateur (anniversaires,
   fêtes, occasions récurrentes) → rappels J-3 et J-1 pour venir
   créer la carte à temps.
   ================================================================ */

const { Schema, model } = require('mongoose');

const OCCASIONS = [
  'anniversaire',
  'mariage',
  'naissance',
  'noel',
  'nouvel-an',
  'saint-valentin',
  'fete-des-meres',
  'fete-des-peres',
  'graduation',
  'autre',
];

const UserDateSchema = new Schema({
  userId:   { type: Schema.Types.ObjectId, ref: 'AdminUser', required: true, index: true },
  name:     { type: String, required: true, maxlength: 80 },       // "Maman", "Ami·e Alex"…
  occasion: { type: String, enum: OCCASIONS, default: 'anniversaire' },

  // Récurrent annuel → on stocke jour + mois (année d'origine facultative
  // pour calculer l'âge / anniversaire de mariage).
  month:      { type: Number, required: true, min: 1, max: 12 },
  day:        { type: Number, required: true, min: 1, max: 31 },
  originYear: { type: Number, min: 1900, max: 2100 },

  // Tracking : dernière année où on a déjà envoyé le rappel — évite les doublons.
  lastRemindedYear: { type: Number },
}, { timestamps: true });

UserDateSchema.index({ userId: 1, month: 1, day: 1 });

UserDateSchema.statics.OCCASIONS = OCCASIONS;

module.exports = model('UserDate', UserDateSchema);
