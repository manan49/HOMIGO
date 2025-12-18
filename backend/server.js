const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const listingRoutes = require('./src/routes/listingRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');

// Load env vars from .env
dotenv.config();

// 👇 Safe default: if PORT not in .env, use 5000
const PORT = process.env.PORT || 5000;

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'HomiGo' });
});

// Connect DB then start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`HomiGo backend running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server due to DB connection error:', error.message);
    process.exit(1);
  });
