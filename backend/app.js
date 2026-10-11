require('dotenv').config({ path: require('node:path').join(__dirname, '.env') });
require('express-async-errors');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const path = require('node:path');
const api = require('./routes/api');
const { csrf } = require('./middleware/csrf');
const { notFound, errorHandler } = require('./middleware/errors');

const app = express();
app.disable('x-powered-by');
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: { directives: {
  defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'", 'https://fonts.googleapis.com'], fontSrc: ["'self'", 'https://fonts.gstatic.com'],
  styleSrcAttr: ["'unsafe-inline'"], imgSrc: ["'self'", 'data:', 'https://images.unsplash.com'], connectSrc: ["'self'"], objectSrc: ["'none'"], upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
} } }));
app.use(express.json({ limit: '30kb' }));
app.use(express.urlencoded({ extended: false, limit: '30kb' }));
app.use(session({
  name: process.env.SESSION_NAME || 'ever-after.sid',
  secret: process.env.SESSION_SECRET || (process.env.NODE_ENV === 'production' ? undefined : 'dev-only-change-this-session-secret-before-launch'),
  resave: false, saveUninitialized: false,
  store: process.env.NODE_ENV === 'test' ? undefined : MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 1000 * 60 * 60 * 24 * 7 }
}));
app.use('/api', (req, res, next) => {
  if (process.env.APP_ORIGIN && req.get('origin') && req.get('origin') !== process.env.APP_ORIGIN) return res.status(403).json({ error: 'Request origin is not allowed.' });
  next();
});
app.use('/api', csrf);
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false }));
app.use('/api/auth/register', rateLimit({ windowMs: 60 * 60 * 1000, limit: 8, standardHeaders: true, legacyHeaders: false }));
app.use('/api/enquiries', rateLimit({ windowMs: 60 * 60 * 1000, limit: 12, standardHeaders: true, legacyHeaders: false }));
app.use('/api/bookings', rateLimit({ windowMs: 60 * 60 * 1000, limit: 12, standardHeaders: true, legacyHeaders: false }));
app.use('/api', api);
app.use(express.static(path.join(__dirname, '../public'), { extensions: ['html'], maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0 }));
app.use(notFound);
app.use(errorHandler);
module.exports = app;
