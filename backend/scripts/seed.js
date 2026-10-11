require('dotenv').config({ path: require('node:path').join(__dirname, '../.env') });
const connectDB = require('../config/db');
const Service = require('../models/Service');
const Package = require('../models/Package');
const Vendor = require('../models/Vendor');

const packages = [
  { name: 'Essential', description: 'Thoughtful guidance for couples who have started planning and want an expert alongside them.', price: 450000, inclusions: ['Planning consultation', 'Vendor recommendations', 'Final-month coordination'] },
  { name: 'Signature', description: 'A creative partner from the first idea through the last dance, with every detail held.', price: 890000, featured: true, inclusions: ['Full planning and design', 'Venue and vendor coordination', 'Wedding-day team', 'Guest experience details'] },
  { name: 'Heirloom', description: 'A bespoke, multi-day celebration for the traditions, gatherings, and little moments around it.', price: 1450000, inclusions: ['Everything in Signature', 'Multi-day event planning', 'Custom creative direction', 'Dedicated lead planner'] }
];
const services = [
  { title: 'Full-service planning', category: 'Planning', description: 'From the first moodboard to the final farewell, we hold every detail with care.' },
  { title: 'Design & florals', category: 'Design', description: 'A considered visual story with thoughtful flowers, layered textures, and rooms that feel like you.' },
  { title: 'The celebration', category: 'Coordination', description: 'We bring trusted creative and event partners together for a day that moves with ease.' }
];
const vendors = [
  { businessName: 'Sample photography partner', category: 'Photography', location: 'Colombo', description: 'Thoughtful, story-led images that make room for the in-between moments.' },
  { businessName: 'Sample floral studio', category: 'Florals', location: 'Colombo', description: 'Seasonal flowers, gathered with a light touch and a sense of place.' },
  { businessName: 'Sample celebration venue', category: 'Venue', location: 'Western Province', description: 'A warm, beautiful setting for a gathering that feels like your own.' }
];
async function main() {
  await connectDB();
  for (const item of packages) await Package.updateOne({ name: item.name }, { $setOnInsert: item }, { upsert: true });
  for (const item of services) await Service.updateOne({ title: item.title }, { $setOnInsert: item }, { upsert: true });
  for (const item of vendors) await Vendor.updateOne({ businessName: item.businessName }, { $setOnInsert: item }, { upsert: true });
  console.log('Starter packages, services, and sample partner listings are ready.');
  await require('mongoose').disconnect();
}
main().catch(async err => { console.error(err.message); await require('mongoose').disconnect(); process.exit(1); });
