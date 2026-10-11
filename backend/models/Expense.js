const mongoose = require('mongoose');
module.exports = mongoose.model('Expense', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  category: { type: String, required: true, trim: true, maxlength: 80 },
  amount: { type: Number, required: true, min: 0 },
  description: { type: String, trim: true, maxlength: 180, default: '' }
}, { timestamps: true }));
