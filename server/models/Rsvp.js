const mongoose = require('mongoose');

const rsvpSchema = new mongoose.Schema({
  publicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Publication', required: true, index: true },

  guestName:  { type: String, required: true, trim: true },
  guestEmail: { type: String, trim: true, lowercase: true, default: '' },
  guestPhone: { type: String, trim: true, default: '' },

  status:     { type: String, enum: ['accepted', 'declined', 'maybe', 'pending'], default: 'pending', index: true },
  plusOnes:   { type: Number, default: 0, min: 0 },
  message:    { type: String, trim: true, default: '' },

  // Lien éventuel vers un Guest pré-importé (mode 'list')
  guestId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Guest', default: null, index: true },
  // Token unique d'invitation (mode 'list')
  token:      { type: String, index: true, sparse: true },

  // Si le message a été republié en post-it
  wishId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Wish', default: null },

  ip:         { type: String, default: '' },
  userAgent:  { type: String, default: '' },
  respondedAt:{ type: Date,   default: Date.now },
}, { timestamps: true });

// En mode public, anti-doublon sur (publicationId, guestEmail)
rsvpSchema.index(
  { publicationId: 1, guestEmail: 1 },
  { unique: true, partialFilterExpression: { guestEmail: { $type: 'string', $ne: '' } } }
);

module.exports = mongoose.model('Rsvp', rsvpSchema);
