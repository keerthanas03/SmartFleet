const mongoose = require('mongoose');
const dns = require('dns');

// Ensure reliable SRV resolution on Windows for MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

// Disable operation buffering so queries never hang or time out if offline
mongoose.set('bufferCommands', false);

let retryTimer = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/smartfleet';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`[SmartFleet DB] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    if (retryTimer) {
      clearInterval(retryTimer);
      retryTimer = null;
    }
  } catch (error) {
    console.warn(`[SmartFleet DB] MongoDB Offline / Atlas IP Whitelist needed: ${error.message}`);
    console.log(`[SmartFleet DB] Operating in Resilient Offline / Demo Mode with instant authentication.`);

    // Auto-retry connection every 20 seconds in the background
    if (!retryTimer) {
      retryTimer = setInterval(async () => {
        try {
          const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/smartfleet';
          const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 4000 });
          console.log(`[SmartFleet DB] MongoDB Connected (Auto-reconnected): ${conn.connection.host}/${conn.connection.name}`);
          clearInterval(retryTimer);
          retryTimer = null;
        } catch (e) {
          // Keep waiting for IP whitelist
        }
      }, 20000);
    }
  }
};

module.exports = connectDB;
