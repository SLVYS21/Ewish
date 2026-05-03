const mongoose = require('mongoose');

const wishSchema = new mongoose.Schema({
  publicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Publication', required: true, index: true },
  firstName:  { type: String, required: true, trim: true },
  role:       { type: String, trim: true },
  message:    { type: String, required: true, trim: true },
  photoUrl:   { type: String }, 
  audioUrl:   { type: String },                  
  videoUrl:   { type: String },                   
  approved:   { type: Boolean, default: false },  
  hidden:     { type: Boolean, default: false },  
}, { timestamps: true });

module.exports = mongoose.model('Wish', wishSchema);
