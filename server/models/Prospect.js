const { Schema, model } = require('mongoose');

const ProspectSchema = new Schema({
  companyName:   { type: String, required: true },
  contactName:   { type: String, default: '' },
  activity:      { type: String, default: '' },          // e.g. "Boulangerie", "Salon de coiffure"
  phone:         { type: String, default: '' },          // WhatsApp number e.g. +2290197xxxxxx
  instagram:     { type: String, default: '' },
  facebook:      { type: String, default: '' },
  source:        { type: String, default: '' },          // where found (Instagram, Facebook, etc.)
  status:        { type: String, enum: ['new', 'contacted', 'interested', 'converted', 'not_interested'], default: 'new' },
  notes:         { type: String, default: '' },
  messageTemplate: { type: String, default: '' },       // custom WA pre-fill text
  lastContactedAt: { type: Date },
  convertedAt:   { type: Date },
}, { timestamps: true });

module.exports = model('Prospect', ProspectSchema);
