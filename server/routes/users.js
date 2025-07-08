const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const isAdmin = require('../utils/adminMiddleware');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const authMiddleware = require('../utils/authMiddleware');

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';

// POST /users/signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Signup successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /users/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin dashboard stats endpoint
// This route is protected: requires authentication and admin role
router.get('/admin/dashboard-stats', authMiddleware, isAdmin, async (req, res) => {
  try {
    const [totalDonationsAgg, totalCampaigns, totalUsers, activeCampaigns] = await Promise.all([
      Donation.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Campaign.countDocuments(),
      User.countDocuments(),
      Campaign.countDocuments({ ended: { $ne: true } })
    ]);
    const totalDonations = totalDonationsAgg[0]?.total || 0;
    res.json({
      totalDonations,
      totalCampaigns,
      totalUsers,
      activeCampaigns
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error: err.message });
  }
});

// GET /users/admin/all-users - List all users (admin only, with optional search)
// Query params: ?search=term
router.get('/admin/all-users', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { search } = req.query;
    // Build a filter for search by name or email (case-insensitive)
    let filter = {};
    if (search) {
      filter = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      };
    }
    // Find users, select only safe fields
    const users = await User.find(filter).select('name email role active');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
});

// DELETE /users/admin/:userId - Delete a user (admin only)
router.delete('/admin/:userId', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const deleted = await User.findByIdAndDelete(userId);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    // Also delete all campaigns created by this user
    await Campaign.deleteMany({ userId });
    res.json({ message: 'User account and all their campaigns deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
});

// GET /users/verify/:userId - Verify if a user exists (for donation checks)
router.get('/verify/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        exists: false, 
        message: 'User not found. You may have been banned or your account deleted.' 
      });
    }
    res.json({ 
      exists: true, 
      message: 'User verified' 
    });
  } catch (err) {
    res.status(500).json({ 
      exists: false, 
      message: 'Failed to verify user', 
      error: err.message 
    });
  }
});

module.exports = router;
