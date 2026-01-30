/**
 * Seed test user + admin for development.
 * Run: node backend/scripts/seedUsers.js
 *
 * Credentials:
 *   User:  user@test.com  / user123
 *   Admin: admin@test.com / admin123
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Wallet = require('../models/Wallet');

const USERS = [
  { email: 'user@test.com', password: 'user123', role: 'user', firstName: 'Test', lastName: 'User' },
  { email: 'admin@test.com', password: 'admin123', role: 'admin', firstName: 'Admin', lastName: 'User' }
];

async function seed() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('MONGODB_URI is required. Set it (e.g. from Railway Variables or .env).');
      process.exit(1);
    }
    await mongoose.connect(uri);
    console.log('MongoDB connected\n');

    for (const u of USERS) {
      let user = await User.findOne({ email: u.email });
      if (user) {
        user.password = u.password;
        user.role = u.role;
        user.firstName = u.firstName;
        user.lastName = u.lastName;
        await user.save();
        console.log(`Updated ${u.role}: ${u.email}`);
      } else {
        user = await User.create({
          email: u.email,
          password: u.password,
          role: u.role,
          firstName: u.firstName,
          lastName: u.lastName,
          kycStatus: u.role === 'admin' ? 'verified' : 'pending'
        });
        await Wallet.create({ userId: user._id, sarBalance: u.role === 'user' ? 50000 : 0 });
        console.log(`Created ${u.role}: ${u.email}`);
      }
    }

    console.log('\n--- Test credentials ---');
    console.log('User:  user@test.com  / user123');
    console.log('Admin: admin@test.com / admin123');
    console.log('------------------------\n');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
