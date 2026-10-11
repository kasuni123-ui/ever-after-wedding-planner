require('dotenv').config({ path: require('node:path').join(__dirname, '.env') });
const app = require('./app');
const connectDB = require('./config/db');
const PORT = Number(process.env.PORT) || 5000;

if (process.env.NODE_ENV === 'production') {
  const originIsValid = (() => { try { return new URL(process.env.APP_ORIGIN).protocol === 'https:'; } catch (_) { return false; } })();
  if (!process.env.MONGODB_URI || !process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32 || !originIsValid) {
    console.error('Production startup requires MONGODB_URI, a SESSION_SECRET of at least 32 characters, and an HTTPS APP_ORIGIN.');
    process.exit(1);
  }
}

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Ever After is ready at http://localhost:${PORT}`));
}).catch(err => {
  console.error(`Database connection failed: ${err.message}`);
  process.exit(1);
});
