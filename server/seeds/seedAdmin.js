/**
 * seedAdmin.js
 * Run: npm run seed:admin
 * Creates an admin user from .env credentials (ADMIN_EMAIL, ADMIN_PASSWORD).
 * If admin already exists, it is skipped (idempotent).
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_FIRSTNAME = 'Nethaji', ADMIN_LASTNAME = 'Admin' } = process.env;

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
      process.exit(1);
    }

    const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    if (existing) {
      console.log(`⚠️  Admin already exists: ${ADMIN_EMAIL}`);
      process.exit(0);
    }

    const admin = await User.create({
      firstName: ADMIN_FIRSTNAME,
      lastName: ADMIN_LASTNAME,
      email: ADMIN_EMAIL.toLowerCase(),
      password: ADMIN_PASSWORD, // pre-save hook will hash it
      role: 'admin',
    });

    console.log(`✅ Admin created: ${admin.email}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
    process.exit(1);
  }
};

seed();
