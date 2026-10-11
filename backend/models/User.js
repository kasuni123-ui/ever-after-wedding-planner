const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, lowercase: true, trim: true, unique: true, maxlength: 254 },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['couple', 'vendor', 'admin'], default: 'couple' }
}, { timestamps: true });
userSchema.index({ email: 1 }, { unique: true });
module.exports = mongoose.model('User', userSchema);
