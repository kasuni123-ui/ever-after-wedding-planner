const mongoose = require('mongoose');
module.exports = mongoose.model('Service', new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  image: { type: String, default: '' },
  active: { type: Boolean, default: true }
}, { timestamps: true }));
