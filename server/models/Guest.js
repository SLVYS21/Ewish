const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
  publicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Publication', required: true, index: true },

  name:  { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true, default: '' },
  phone: { type: String, trim: true, default: '' },

  // Token unique pour le lien personnel /rsvp/:token
  token: { type: String, required: true, unique: true, index: true },

  // Méta optionnelles (table, groupe, etc.)
  group: { type: String, default: '' },
  notes: { type: String, default: '' },

  // Suivi d'envoi
  sentAt:   { type: Date, default: null },
  sentVia:  { type: String, enum: ['email', 'sms', 'manual', 'none'], default: 'none' },

  // Réponse liée (si déjà répondu)
  rsvpId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rsvp', default: null },
}, { timestamps: true });

guestSchema.index({ publicationId: 1, email: 1 });

module.exports = mongoose.model('Guest', guestSchema);
