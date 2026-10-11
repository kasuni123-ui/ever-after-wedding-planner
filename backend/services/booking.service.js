const Booking = require('../models/Booking');
const Package = require('../models/Package');

async function createBooking({ user, input }) {
  const pack = await Package.findOne({ _id: input.packageId, active: true });
  if (!pack) {
    const error = new Error('That package is not available.'); error.status = 400; throw error;
  }
  const date = new Date(input.eventDate);
  if (date < new Date(new Date().toDateString())) {
    const error = new Error('Choose a future wedding date.'); error.status = 400; throw error;
  }
  return Booking.create({
    userId: user.id, contactName: user.name, contactEmail: user.email,
    packageId: pack.id, packageName: pack.name, eventDate: date,
    guestCount: Number(input.guestCount), services: input.services || [], notes: input.notes || ''
  });
}

module.exports = { createBooking };
