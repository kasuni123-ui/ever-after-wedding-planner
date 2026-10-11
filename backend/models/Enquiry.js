const mongoose = require('mongoose');
module.exports = mongoose.model('Enquiry', new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
  message: { type: String, required: true, trim: true, maxlength: 3000 },
  status: { type: String, enum: ['new', 'read', 'replied', 'closed'], default: 'new' }
}, { timestamps: true }));
