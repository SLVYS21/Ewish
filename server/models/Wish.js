const mongoose = require('mongoose');

const wishSchema = new mongoose.Schema({
  publicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Publication', required: true, index: true },
  firstName:  { type: String, required: true, trim: true },
  role:       { type: String, trim: true },       // "Manager", "BFF", "Papa"...
  message:    { type: String, required: true, trim: true },
  photoUrl:   { type: String },                   // uploaded photo URL
  approved:   { type: Boolean, default: false },  // admin must approve before display
  hidden:     { type: Boolean, default: false },  // soft-hide without delete
}, { timestamps: true });

module.exports = mongoose.model('Wish', wishSchema);