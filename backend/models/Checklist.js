const mongoose = require('mongoose');
module.exports = mongoose.model('Checklist', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  tasks: [{ title: { type: String, required: true, maxlength: 180 }, dueDate: Date, completed: { type: Boolean, default: false } }]
}, { timestamps: true }));
