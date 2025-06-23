//server/routes/campaigns.js

const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const Withdrawal = require('../models/Withdrawal');
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
    const campaigns = await Campaign.find({
      $or: [
        { ended: false },
        { ended: { $exists: false } }
      ]
    }).populate('userId', 'name');

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
        progress: Math.round(progress),
        organizerName: c.userId?.name || 'Anonymous'
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

    const campaigns = await Campaign.find({ userId }).populate('userId', 'name');

    const donations = await Donation.aggregate([
      { $group: { _id: "$campaignTitle", totalDonated: { $sum: "$amount" } } }
    ]);

    const withdrawals = await Withdrawal.aggregate([
      { $group: { _id: "$campaignId", totalWithdrawn: { $sum: "$amount" } } }
    ]);

    const enriched = campaigns.map(c => {
      const donationMatch = donations.find(d => d._id === c.title);
      const withdrawalMatch = withdrawals.find(w => w._id.toString() === c._id.toString());
      
      const amount = donationMatch?.totalDonated || 0;
      const totalWithdrawn = withdrawalMatch?.totalWithdrawn || 0;
      const availableFunds = amount - totalWithdrawn;
      const progress = c.goal ? Math.min((amount / c.goal) * 100, 100) : 0;

      return {
        ...c.toObject(),
        amount,
        totalWithdrawn,
        availableFunds,
        progress: Math.round(progress),
        organizerName: c.userId?.name || 'Anonymous'
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error("❌ Failed to fetch user campaigns:", err);
    res.status(500).json({ message: "Failed to fetch campaigns by user" });
  }
});

// ✅ PUT /campaigns/:id — update campaign info
router.put('/:id', async (req, res) => {
  try {
    const { title, goal, description } = req.body;
    const updated = await Campaign.findByIdAndUpdate(req.params.id, {
      title,
      goal,
      description,
    }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Update failed' });
  }
});

// ✅ PUT /campaigns/:id/end — mark a campaign as ended with timestamp
router.put('/:id/end', async (req, res) => {
  try {
    console.log("🔔 PUT /:id/end HIT:", req.params.id);
    const updated = await Campaign.findByIdAndUpdate(
      req.params.id,
      {
        ended: true,
        endedAt: new Date(),
      },
      { new: true }
    );
    console.log("📦 Updated:", updated);
    res.json(updated);
  } catch (err) {
    console.error('❌ Failed to end campaign:', err);
    res.status(500).json({ message: 'Failed to end campaign' });
  }
});

// ✅ GET /campaigns/:id — fetch a single enriched campaign by ID
router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('userId', 'name');
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const donationStats = await Donation.aggregate([
      { $match: { campaignTitle: campaign.title } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const withdrawalStats = await Withdrawal.aggregate([
      { $match: { campaignId: req.params.id } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const amount = donationStats[0]?.total || 0;
    const totalWithdrawn = withdrawalStats[0]?.total || 0;
    const availableFunds = amount - totalWithdrawn;
    const progress = campaign.goal ? Math.min((amount / campaign.goal) * 100, 100) : 0;

    res.json({
      ...campaign.toObject(),
      amount,
      totalWithdrawn,
      availableFunds,
      progress: Math.round(progress),
      organizerName: campaign.userId?.name || 'Anonymous'
    });
  } catch (err) {
    console.error('❌ Error fetching campaign by ID:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ✅ POST /campaigns/:id/withdraw — withdraw funds from a campaign
router.post('/:id/withdraw', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, accountName, accountNumber, purpose, email, userId } = req.body;

    // Find the campaign
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Calculate total donations for this campaign
    const donationStats = await Donation.aggregate([
      { $match: { campaignTitle: campaign.title } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalRaised = donationStats[0]?.total || 0;

    // Calculate total withdrawals for this campaign
    const withdrawalStats = await Withdrawal.aggregate([
      { $match: { campaignId: id } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalWithdrawn = withdrawalStats[0]?.total || 0;
    const availableFunds = totalRaised - totalWithdrawn;

    // Check if there are funds to withdraw
    if (availableFunds <= 0) {
      return res.status(400).json({ message: 'No funds available to withdraw' });
    }

    // Check if withdrawal amount is valid
    if (amount > availableFunds) {
      return res.status(400).json({ message: 'Withdrawal amount exceeds available funds' });
    }

    // Save the withdrawal record
    const withdrawal = new Withdrawal({
      campaignId: id,
      userId: userId || campaign.userId, // Use provided userId or campaign owner's userId
      amount: amount,
      paymentMethod,
      accountName,
      accountNumber,
      purpose,
      email,
      status: 'processed' // Direct transfer - no admin approval needed
    });

    await withdrawal.save();

    console.log(`💰 Withdrawal processed for campaign "${campaign.title}": $${amount} transferred to ${accountName}`);

    res.json({ 
      message: 'Funds transferred successfully',
      amount: amount,
      campaignTitle: campaign.title,
      remainingFunds: availableFunds - amount
    });

  } catch (err) {
    console.error('❌ Error processing withdrawal:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ✅ GET /campaigns/:id/withdrawals — fetch withdrawal history for a campaign
router.get('/:id/withdrawals', async (req, res) => {
  try {
    const { id } = req.params;

    // Verify campaign exists
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Fetch withdrawals for this campaign, sorted by date (newest first)
    const withdrawals = await Withdrawal.find({ campaignId: id })
      .sort({ withdrawnAt: -1 })
      .select('-__v'); // Exclude version key

    res.json(withdrawals);
  } catch (err) {
    console.error('❌ Error fetching withdrawal history:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
