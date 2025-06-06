const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const { upload } = require('../utils/cloudinary');

// ✅ POST /campaigns — Create a campaign with image + userId
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, goal, location, category, description, userId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Image upload failed. Please select a valid image.' });
    }

    const newCampaign = new Campaign({
      title,
      goal,
      location,
      category,
      description,
      imageUrl: req.file.path,
      userId,
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

// ✅ GET /campaigns — fetch all campaigns
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (err) {
    console.error('❌ Failed to fetch campaigns:', err.message);
    res.status(500).json({ message: 'Failed to fetch campaigns', error: err.message });
  }
});

// ✅ GET /campaigns/with-donations — Public enriched campaigns
router.get('/with-donations', async (req, res) => {
  try {
    const campaigns = await Campaign.find();
    const donations = await Donation.aggregate([
      { $group: { _id: "$campaignTitle", totalDonated: { $sum: "$amount" } } }
    ]);

    const enriched = campaigns.map(c => {
      const match = donations.find(d => d._id === c.title);
      const amount = match?.totalDonated || 0;
      const progress = c.goal ? Math.min((amount / c.goal) * 100, 100) : 0;

      return {
        ...c.toObject(),
        amount,
        progress: Math.round(progress)
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error("❌ Failed to fetch enriched campaigns:", err);
    res.status(500).json({ message: "Failed to fetch campaigns with donations" });
  }
});

// ✅ GET /campaigns/user/:userId — Personal campaigns with progress
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const campaigns = await Campaign.find({ userId });

    const donations = await Donation.aggregate([
      { $group: { _id: "$campaignTitle", totalDonated: { $sum: "$amount" } } }
    ]);

    const enriched = campaigns.map(c => {
      const match = donations.find(d => d._id === c.title);
      const amount = match?.totalDonated || 0;
      const progress = c.goal ? Math.min((amount / c.goal) * 100, 100) : 0;

      return {
        ...c.toObject(),
        amount,
        progress: Math.round(progress)
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error("❌ Failed to fetch user campaigns:", err);
    res.status(500).json({ message: "Failed to fetch campaigns by user" });
  }
});

module.exports = router;
