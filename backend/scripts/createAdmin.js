/**
 * Script to create an admin user
 * Run: node backend/scripts/createAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Wallet = require('../models/Wallet');

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gold-trading');
    console.log('Connected to MongoDB');

    const email = process.argv[2] || 'admin@example.com';
    const password = process.argv[3] || 'admin123';
    const role = process.argv[4] || 'admin';

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`User ${email} already exists. Updating role to ${role}...`);
      existingUser.role = role;
      await existingUser.save();
      console.log(`User role updated to ${role}`);
    } else {
      // Create new user
      const user = await User.create({
        email,
        password,
        role,
        firstName: 'Admin',
        lastName: 'User',
        kycStatus: 'verified'
      });

      // Create wallet
      await Wallet.create({ userId: user._id });

      console.log(`\n✅ ${role} user created successfully!`);
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
      console.log(`Role: ${role}\n`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdmin();
