const mongoose = require('mongoose');

const wishSchema = new mongoose.Schema({
  publicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Publication', required: true, index: true },
  firstName:  { type: String, required: true, trim: true },
  role:       { type: String, trim: true, default: '' },
  message:    { type: String, required: true, trim: true },
  photoUrl:   { type: String, default: '' },
  audioUrl:   { type: String, default: '' },
  videoUrl:   { type: String, default: '' },
  color:      { type: Number, default: 0, min: 0, max: 6 },
  rot:        { type: Number, default: 0 },
  mediaType:  { type: String, enum: ['none', 'photo', 'gif', 'audio', 'video'], default: 'none' },
  approved:   { type: Boolean, default: false },
  hidden:     { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Wish', wishSchema);
