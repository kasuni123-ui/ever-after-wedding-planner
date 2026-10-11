const express = require('express');
const crypto = require('node:crypto');
const argon2 = require('argon2');
const { body, param } = require('express-validator');
const User = require('../models/User');
const Service = require('../models/Service');
const Package = require('../models/Package');
const Vendor = require('../models/Vendor');
const Booking = require('../models/Booking');
const Enquiry = require('../models/Enquiry');
const Checklist = require('../models/Checklist');
const Expense = require('../models/Expense');
const validate = require('../middleware/validate');
const { requireAuth, requireRole } = require('../middleware/auth');
const { createToken } = require('../middleware/csrf');

const router = express.Router();
const emailCheck = body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail();
const statuses = ['pending', 'approved', 'rejected', 'cancelled'];
router.get('/health', (req, res) => res.json({ status: 'ok', service: 'ever-after-api' }));

router.get('/auth/csrf', (req, res) => {
  if (!req.session.csrfToken) req.session.csrfToken = createToken();
  res.json({ csrfToken: req.session.csrfToken });
});
router.get('/auth/me', (req, res) => res.json({ user: req.session.user || null }));
router.post('/auth/register', [body('name').trim().isLength({ min: 2, max: 100 }), emailCheck, body('password').isLength({ min: 10, max: 128 }).withMessage('Use at least 10 characters for your password.'), validate], async (req, res) => {
  const name = req.body.name.trim();
  const passwordHash = await argon2.hash(req.body.password, { type: argon2.argon2id });
  const user = await User.create({ name, email: req.body.email, passwordHash, role: 'couple' });
  req.session.regenerate(err => {
    if (err) return res.status(500).json({ error: 'Could not start your session.' });
    req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    req.session.csrfToken = createToken();
    req.session.save(saveErr => saveErr ? res.status(500).json({ error: 'Could not start your session.' }) : res.status(201).json({ user: req.session.user, csrfToken: req.session.csrfToken }));
  });
});
router.post('/auth/login', [emailCheck, body('password').isString().isLength({ min: 1, max: 128 }), validate], async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+passwordHash');
  if (!user || !(await argon2.verify(user.passwordHash, req.body.password))) return res.status(401).json({ error: 'Email or password is incorrect.' });
  req.session.regenerate(err => {
    if (err) return res.status(500).json({ error: 'Could not start your session.' });
    req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    req.session.csrfToken = createToken();
    req.session.save(saveErr => saveErr ? res.status(500).json({ error: 'Could not start your session.' }) : res.json({ user: req.session.user, csrfToken: req.session.csrfToken }));
  });
});
router.post('/auth/logout', (req, res) => req.session.destroy(err => {
  if (err) return res.status(500).json({ error: 'Could not sign out.' });
  res.clearCookie(process.env.SESSION_NAME || 'ever-after.sid');
  res.json({ ok: true });
}));

router.get('/services', async (req, res) => res.json({ services: await Service.find({ active: true }).sort({ title: 1 }).limit(100).lean() }));
router.get('/packages', async (req, res) => res.json({ packages: await Package.find({ active: true }).sort({ price: 1 }).limit(100).lean() }));
router.get('/vendors', async (req, res) => {
  const query = { status: 'approved' };
  if (req.query.category) query.category = String(req.query.category).slice(0, 80);
  if (req.query.search) query.$or = ['businessName', 'category', 'location'].map(key => ({ [key]: { $regex: String(req.query.search).slice(0, 60), $options: 'i' } }));
  res.json({ vendors: await Vendor.find(query).sort({ businessName: 1 }).limit(100).lean() });
});
router.post('/enquiries', [body('name').trim().isLength({ min: 2, max: 100 }), emailCheck, body('message').trim().isLength({ min: 10, max: 3000 }), validate], async (req, res) => {
  const enquiry = await Enquiry.create({ name: req.body.name, email: req.body.email, message: req.body.message });
  res.status(201).json({ message: 'Thank you. Your enquiry has been received.', id: enquiry.id });
});
router.post('/bookings', requireAuth, requireRole('couple'), [body('packageId').isMongoId(), body('eventDate').isISO8601().withMessage('Choose a valid date.'), body('guestCount').isInt({ min: 1, max: 5000 }), body('services').optional().isArray({ max: 12 }), body('notes').optional().trim().isLength({ max: 2000 }), validate], async (req, res) => {
  const eventDate = new Date(req.body.eventDate);
  if (eventDate < new Date(new Date().toDateString())) return res.status(400).json({ error: 'Choose a future wedding date.' });
  const pack = await Package.findOne({ _id: req.body.packageId, active: true });
  if (!pack) return res.status(400).json({ error: 'That package is not available.' });
  const booking = await Booking.create({ userId: req.user.id, contactName: req.user.name, contactEmail: req.user.email, packageId: pack.id, packageName: pack.name, eventDate, guestCount: Number(req.body.guestCount), services: (req.body.services || []).map(String).slice(0, 12), notes: req.body.notes || '' });
  res.status(201).json({ booking });
});
router.get('/bookings/mine', requireAuth, requireRole('couple'), async (req, res) => res.json({ bookings: await Booking.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(100).lean() }));
router.patch('/bookings/:id/cancel', requireAuth, requireRole('couple'), [param('id').isMongoId(), validate], async (req, res) => {
  const booking = await Booking.findOneAndUpdate({ _id: req.params.id, userId: req.user.id, status: 'pending' }, { status: 'cancelled' }, { new: true, runValidators: true });
  if (!booking) return res.status(404).json({ error: 'A pending request was not found.' });
  res.json({ booking });
});
router.get('/checklists/mine', requireAuth, requireRole('couple'), async (req, res) => {
  let checklist = await Checklist.findOne({ userId: req.user.id });
  if (!checklist) checklist = await Checklist.create({ userId: req.user.id, tasks: [
    { title: 'Choose your wedding date' }, { title: 'Set a celebration budget' }, { title: 'Explore venues' }, { title: 'Create your guest list' }, { title: 'Choose your ceremony style' }
  ] });
  res.json({ checklist });
});
router.put('/checklists/mine', requireAuth, requireRole('couple'), [body('tasks').isArray({ max: 80 }), body('tasks.*.title').trim().isLength({ min: 1, max: 180 }), body('tasks.*.completed').isBoolean(), validate], async (req, res) => {
  const tasks = req.body.tasks.map(t => ({ title: t.title, completed: t.completed, dueDate: t.dueDate || undefined }));
  const checklist = await Checklist.findOneAndUpdate({ userId: req.user.id }, { $set: { tasks }, $setOnInsert: { userId: req.user.id } }, { upsert: true, new: true, runValidators: true });
  res.json({ checklist });
});
router.get('/expenses/mine', requireAuth, requireRole('couple'), async (req, res) => res.json({ expenses: await Expense.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(200).lean() }));
router.post('/expenses', requireAuth, requireRole('couple'), [body('category').trim().isLength({ min: 1, max: 80 }), body('amount').isFloat({ min: 0, max: 1000000000 }), body('description').optional().trim().isLength({ max: 180 }), validate], async (req, res) => res.status(201).json({ expense: await Expense.create({ userId: req.user.id, category: req.body.category, amount: Number(req.body.amount), description: req.body.description || '' }) }));
router.delete('/expenses/:id', requireAuth, requireRole('couple'), [param('id').isMongoId(), validate], async (req, res) => {
  const removed = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!removed) return res.status(404).json({ error: 'Expense was not found.' });
  res.json({ ok: true });
});

router.get('/admin/bookings', requireAuth, requireRole('admin'), async (req, res) => {
  const bookings = await Booking.find().populate('userId', 'name email').sort({ createdAt: -1 }).limit(200).lean();
  res.json({ bookings });
});
router.get('/admin/catalog', requireAuth, requireRole('admin'), async (req, res) => {
  const [services, packages, vendors] = await Promise.all([
    Service.find().sort({ title: 1 }).limit(200).lean(),
    Package.find().sort({ price: 1 }).limit(200).lean(),
    Vendor.find().sort({ businessName: 1 }).limit(200).lean()
  ]);
  res.json({ services, packages, vendors });
});
router.post('/admin/services', requireAuth, requireRole('admin'), [body('title').trim().isLength({ min: 2, max: 120 }), body('description').trim().isLength({ min: 10, max: 1200 }), body('category').trim().isLength({ min: 2, max: 80 }), body('image').optional().isURL({ protocols: ['https'], require_protocol: true }), validate], async (req, res) => {
  res.status(201).json({ service: await Service.create({ title: req.body.title, description: req.body.description, category: req.body.category, image: req.body.image || '' }) });
});
router.patch('/admin/services/:id/active', requireAuth, requireRole('admin'), [param('id').isMongoId(), body('active').isBoolean(), validate], async (req, res) => {
  const service = await Service.findByIdAndUpdate(req.params.id, { active: req.body.active }, { new: true, runValidators: true });
  if (!service) return res.status(404).json({ error: 'Service was not found.' });
  res.json({ service });
});
router.post('/admin/packages', requireAuth, requireRole('admin'), [body('name').trim().isLength({ min: 2, max: 100 }), body('description').trim().isLength({ min: 10, max: 1200 }), body('price').isFloat({ min: 0, max: 1000000000 }), body('inclusions').isArray({ min: 1, max: 30 }), body('inclusions.*').trim().isLength({ min: 1, max: 180 }), validate], async (req, res) => {
  res.status(201).json({ package: await Package.create({ name: req.body.name, description: req.body.description, price: Number(req.body.price), inclusions: req.body.inclusions }) });
});
router.patch('/admin/packages/:id/active', requireAuth, requireRole('admin'), [param('id').isMongoId(), body('active').isBoolean(), validate], async (req, res) => {
  const pack = await Package.findByIdAndUpdate(req.params.id, { active: req.body.active }, { new: true, runValidators: true });
  if (!pack) return res.status(404).json({ error: 'Package was not found.' });
  res.json({ package: pack });
});
router.post('/admin/vendors', requireAuth, requireRole('admin'), [body('businessName').trim().isLength({ min: 2, max: 120 }), body('category').trim().isLength({ min: 2, max: 80 }), body('location').trim().isLength({ min: 2, max: 120 }), body('contact').optional().trim().isLength({ max: 254 }), body('description').optional().trim().isLength({ max: 1200 }), body('image').optional().isURL({ protocols: ['https'], require_protocol: true }), validate], async (req, res) => {
  res.status(201).json({ vendor: await Vendor.create({ ...req.body, status: 'approved' }) });
});
router.patch('/admin/vendors/:id/status', requireAuth, requireRole('admin'), [param('id').isMongoId(), body('status').isIn(['pending', 'approved', 'hidden']), validate], async (req, res) => {
  const vendor = await Vendor.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
  if (!vendor) return res.status(404).json({ error: 'Partner was not found.' });
  res.json({ vendor });
});
router.get('/admin/users', requireAuth, requireRole('admin'), async (req, res) => {
  const users = await User.find().select('name email role createdAt').sort({ createdAt: -1 }).limit(300).lean();
  res.json({ users });
});
router.patch('/admin/users/:id/role', requireAuth, requireRole('admin'), [param('id').isMongoId(), body('role').isIn(['couple', 'vendor', 'admin']), validate], async (req, res) => {
  if (req.params.id === req.user.id && req.body.role !== 'admin') return res.status(400).json({ error: 'You cannot remove your own administrator access.' });
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true, runValidators: true }).select('name email role');
  if (!user) return res.status(404).json({ error: 'Account was not found.' });
  res.json({ user });
});
router.patch('/admin/bookings/:id', requireAuth, requireRole('admin'), [param('id').isMongoId(), body('status').isIn(statuses), validate], async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
  if (!booking) return res.status(404).json({ error: 'Booking was not found.' });
  res.json({ booking });
});
router.get('/admin/enquiries', requireAuth, requireRole('admin'), async (req, res) => res.json({ enquiries: await Enquiry.find().sort({ createdAt: -1 }).limit(200).lean() }));
router.patch('/admin/enquiries/:id', requireAuth, requireRole('admin'), [param('id').isMongoId(), body('status').isIn(['new', 'read', 'replied', 'closed']), validate], async (req, res) => {
  const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
  if (!enquiry) return res.status(404).json({ error: 'Enquiry was not found.' });
  res.json({ enquiry });
});

module.exports = router;
