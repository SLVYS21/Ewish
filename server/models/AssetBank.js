const mongoose = require('mongoose');

const assetBankSchema = new mongoose.Schema({
  type:    { type: String, enum: ['background', 'decoration'], required: true, index: true },
  name:    { type: String, default: '' },
  url:     { type: String, required: true },        // Cloudinary URL
  publicId:{ type: String, default: '' },           // Cloudinary public_id for deletion
  tags:    [{ type: String }],                      // ex: ['floral', 'birthday', 'dark']
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
}, { timestamps: true });

module.exports = mongoose.model('AssetBank', assetBankSchema);
