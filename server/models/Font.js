const mongoose = require('mongoose');

const fontSchema = new mongoose.Schema({
  name:      { type: String, required: true, unique: true },  // display name e.g. "Clash Display"
  url:       { type: String, required: true },                // Cloudinary raw URL
  format:    { type: String, enum: ['woff2', 'woff', 'truetype', 'opentype'], default: 'woff2' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Font', fontSchema);