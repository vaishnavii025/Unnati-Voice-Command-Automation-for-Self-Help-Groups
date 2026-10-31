
const mongoose = require('mongoose');

async function connectDB() {
  const uri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI;

  if (!uri) {
    console.error('MongoDB connection failed: MONGO_URI is missing in .env');
    return false;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: Number(
        process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || 10000
      ),
    });

    console.log('MongoDB connected successfully');
    console.log('Database:', mongoose.connection.name);

    return true;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    return false;
  }
}

module.exports = connectDB;
