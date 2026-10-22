require('dotenv').config();
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/smartfleet';
    await mongoose.connect(mongoUri);
    console.log('[Seed Admin] Connected to MongoDB');

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@smartfleet.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const adminName = process.env.ADMIN_NAME || 'SmartFleet Administrator';
    const adminPhone = process.env.ADMIN_PHONE || '+919876543210';

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`[Seed Admin] Admin with email ${adminEmail} already exists. Updating role to admin.`);
      existingAdmin.role = 'admin';
      existingAdmin.verificationStatus = 'approved';
      await existingAdmin.save();
      console.log('[Seed Admin] Admin account verified and active.');
    } else {
      await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        phone: adminPhone,
        role: 'admin',
        verificationStatus: 'approved',
      });
      console.log(`[Seed Admin] Admin account created successfully:`);
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
    }

    await mongoose.disconnect();
    console.log('[Seed Admin] Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Admin] Error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
