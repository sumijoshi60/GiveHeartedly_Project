// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();


console.log('✅ Loaded ENV:', {
  cloud: process.env.CLOUDINARY_CLOUD_NAME || '❌ MISSING',
  key: process.env.CLOUDINARY_API_KEY || '❌ MISSING',
  secret: process.env.CLOUDINARY_API_SECRET ? '✅ Present' : '❌ MISSING',
  mongo: process.env.MONGO_URI ? '✅ Present' : '❌ MISSING',
});

const campaignRoutes = require('./routes/campaigns');
const userRoutes = require('./routes/users');
const stripeRoutes = require('./routes/stripe');
const donationRoutes = require('./routes/donation');


const app = express();

// ✅ CORS Middleware
app.use(cors());
app.options('*', cors());

// ✅ JSON Parser Middleware
app.use(express.json());

// ✅ Route Middleware
app.use('/campaigns', campaignRoutes);
app.use('/users', userRoutes);
app.use('/stripe', stripeRoutes);

// Global error handler to always return JSON
app.use((err, req, res, next) => {
  console.error('🌍 Global error handler:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: err.stack || err.toString(),
  });
});

app.use('/api/donations', donationRoutes);


// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    const PORT = 5001;
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
