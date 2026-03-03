require('dotenv').config();
const mongoose = require('mongoose');
const AdminUser = require('./models/AdminUser');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wishwell';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const email = process.env.ADMIN_EMAIL || 'admin@ewishwell.com';
  const password = process.env.ADMIN_PASSWORD || 'changeme123';
  const name = 'Admin eWishWell';

  const existing = await AdminUser.findOne({ email });
  if (existing) {
    console.log(`ℹ️  Admin already exists: ${email}`);
    console.log('To reset password, delete the user in MongoDB and re-run this script.');
  } else {
    const user = await AdminUser.create({ email, password, name, role: 'super_admin' });
    console.log(`✅ Admin created: ${user.email}`);
    console.log(`   Password: ${password}`);
    console.log(`   ⚠️  Change this password immediately!`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });