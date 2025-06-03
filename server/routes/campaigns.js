const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const { upload } = require('../utils/cloudinary');

// 🌐 Update this to your ngrok public URL
const NGROK_BASE_URL = 'https://7eae-113-199-231-162.ngrok-free.app';

// POST /campaigns — handles Cloudinary image upload
router.post('/', upload.single('image'), async (req, res) => {
  try {
    console.log('📥 Incoming POST /campaigns');
    console.log('🧾 req.body:', req.body);
    console.log('🖼️ req.file:', req.file);

    // Check for Cloudinary credentials
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('❌ Cloudinary credentials missing!');
      return res.status(500).json({ message: 'Cloudinary credentials missing. Check your .env file.' });
    }

    const { title, goal, location, category, description } = req.body;

    if (!req.file) {
      console.error('❌ No file received from frontend');
      return res.status(400).json({ message: 'Image upload failed. Please select a valid image.' });
    }

    const newCampaign = new Campaign({
      title,
      goal,
      location,
      category,
      description,
      imageUrl: req.file.path,
    });

    const saved = await newCampaign.save();
    console.log('✅ Campaign saved:', saved);
    res.status(201).json(saved);

  } catch (err) {
    console.error('❌ Campaign creation failed:', err);
    res.status(500).json({
      message: 'Campaign creation failed',
      error: err.message || err.toString(),
      stack: err.stack || 'No stack trace available',
    });
  }
});

// GET /campaigns — fetch all campaigns
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (err) {
    console.error('❌ Failed to fetch campaigns:', err.message);
    res.status(500).json({ message: 'Failed to fetch campaigns', error: err.message });
  }
});

// GET /donate/:id — eSewa test redirect
router.get('/donate/:id', (req, res) => {
  const { id } = req.params;

  const params = new URLSearchParams({
    amt: '90',
    psc: '2',
    pdc: '3',
    txAmt: '5',
    tAmt: '100',
    pid: id,
    scd: 'EPAYTEST',
    su: `${NGROK_BASE_URL}/success?pid=${id}`,
    fu: `${NGROK_BASE_URL}/failure`
  }).toString();

  res.redirect(`https://uat.esewa.com.np/epay/main?${params}`);
});

module.exports = router;
