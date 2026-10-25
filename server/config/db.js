const mongoose = require('mongoose');
const dns = require('dns');

// Ensure reliable SRV resolution on Windows for MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

/**
 * Connect to MongoDB Atlas using Mongoose
 * Reads MONGO_URI from process.env and throws if unavailable or connection fails
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    const errorMsg = 'MONGO_URI is not defined in environment variables. Please check your .env file.';
    console.error(`[SmartFleet DB] MongoDB Connection Error: ${errorMsg}`);
    throw new Error(errorMsg);
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[SmartFleet DB] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[SmartFleet DB] MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

// Monitor runtime database connection events
mongoose.connection.on('error', (err) => {
  console.error(`[SmartFleet DB] MongoDB runtime error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('[SmartFleet DB] MongoDB disconnected');
});

module.exports = connectDB;

