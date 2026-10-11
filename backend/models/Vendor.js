const mongoose = require('mongoose');
module.exports = mongoose.model('Vendor', new mongoose.Schema({
  businessName: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  contact: { type: String, default: '' },
  description: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'approved', 'hidden'], default: 'approved' },
  image: { type: String, default: '' }
}, { timestamps: true }));
