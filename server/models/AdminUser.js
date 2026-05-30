const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminUserSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  name:     { type: String, default: 'Admin' },
  role:     { type: String, enum: ['super_admin', 'admin', 'merchant'], default: 'admin' },
  merchantId:{ type: String, index: true },
  credits:   { type: Number, default: 0 },
  lastLogin: { type: Date },
  kycStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
  kycName:   { type: String, default: '' },
  kycMethod: { type: String, default: '' },
  kycPhone:  { type: String, default: '' },
  kycDocumentUrl:       { type: String, default: '' },
  kycSelfieUrl:         { type: String, default: '' },
  kycSubmittedAt:       { type: Date },
  kycRejectionReason:   { type: String, default: '' },
  kycMobileToken:       { type: String },
  kycMobileTokenExpiry: { type: Date },
  googleId:             { type: String, default: '' },
}, { timestamps: true });

adminUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

adminUserSchema.methods.comparePassword = function(plain) {
  return bcrypt.compare(plain, this.password);
};

adminUserSchema.methods.toSafeObject = function() {
  const {
    _id, email, name, role, merchantId, credits, lastLogin, createdAt,
    kycStatus, kycName, kycMethod, kycPhone,
    kycDocumentUrl, kycSelfieUrl, kycSubmittedAt, kycRejectionReason,
  } = this;
  return {
    _id, email, name, role, merchantId, credits, lastLogin, createdAt,
    kycStatus, kycName, kycMethod, kycPhone,
    kycDocumentUrl, kycSelfieUrl, kycSubmittedAt, kycRejectionReason,
  };
};

module.exports = mongoose.model('AdminUser', adminUserSchema);