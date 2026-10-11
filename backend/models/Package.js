const mongoose = require('mongoose');
module.exports = mongoose.model('Package', new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  inclusions: { type: [String], default: [] },
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true }
}, { timestamps: true }));
