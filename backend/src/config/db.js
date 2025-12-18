const mongoose = require('mongoose');

async function connectDB() {
  const { MONGO_URL } = process.env;

  if (!MONGO_URL) {
    throw new Error('MONGO_URL environment variable is required');
  }

  try {
    await mongoose.connect(MONGO_URL);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
}

module.exports = connectDB;




