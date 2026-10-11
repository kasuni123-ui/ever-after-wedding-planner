require('dotenv').config({ path: require('node:path').join(__dirname, '../.env') });
const connectDB = require('../config/db');
const User = require('../models/User');
async function main() {
  const email = String(process.argv[2] || '').trim().toLowerCase();
  if (!email) throw new Error('Usage: node backend/scripts/make-admin.js account@example.com');
  await connectDB();
  const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
  if (!user) throw new Error('No account found for that email. Register the account first.');
  console.log(`${user.email} now has the administrator role.`);
  process.exit(0);
}
main().catch(err => { console.error(err.message); process.exit(1); });
