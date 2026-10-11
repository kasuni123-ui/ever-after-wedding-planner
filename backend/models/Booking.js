const mongoose = require('mongoose');
module.exports = mongoose.model('Booking', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  contactName: { type: String, required: true, trim: true, maxlength: 100 },
  contactEmail: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
  packageName: { type: String, required: true },
  eventDate: { type: Date, required: true },
  guestCount: { type: Number, required: true, min: 1, max: 5000 },
  services: [{ type: String, trim: true }],
  notes: { type: String, trim: true, maxlength: 2000, default: '' },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending', index: true }
}, { timestamps: true }));
