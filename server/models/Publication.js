const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema({
  templateName: { type: String, required: true },   // e.g. "birthday"
  customName: { type: String, required: true },      // e.g. "lydia-25ans" (slug)
  title: { type: String, default: 'My Wish' },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },  // all customizable fields
  style: {
    primaryColor: { type: String, default: '#ff69b4' },
    accentColor:  { type: String, default: '#ffb347' },
    fontFamily:   { type: String, default: 'Work Sans' },
    fontSize:     { type: String, default: 'medium' },    // small | medium | large
    theme:        { type: String, default: 'light' },     // light | dark | auto
  },
  published: { type: Boolean, default: false },
  publishedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Unique constraint: one customName per templateName
publicationSchema.index({ templateName: 1, customName: 1 }, { unique: true });

module.exports = mongoose.model('Publication', publicationSchema);