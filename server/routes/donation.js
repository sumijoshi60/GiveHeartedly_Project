// routes/donations.js
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Donation = require('../models/Donation');

// ✅ Save donation only once per session (atomic version)
router.post('/save-donation', async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    console.log("📦 Retrieved session:", session);
    console.log("📌 Metadata:", session.metadata);

    if (!session.metadata?.userId) {
      throw new Error("userId missing in session metadata");
    }

    const result = await Donation.findOneAndUpdate(
      { sessionId: session.id },
      {
        $setOnInsert: {
          userId: session.metadata.userId,
          email: session.customer_email || session.customer_details?.email || null,
          amount: session.amount_total / 100,
          currency: session.currency,
          paymentStatus: session.payment_status,
          campaignTitle: session.metadata.campaignTitle || 'Unknown',
          date: new Date(),
        },
      },
      {
        upsert: true,
        new: false, // null if inserted, existing doc if already there
      }
    );

    if (result) {
      console.log("⚠️ Donation already saved for session:", session.id);
      return res.status(200).json({ message: 'Donation already exists' });
    }

    console.log("✅ Donation saved for session:", session.id);
    res.status(200).json({ message: 'Donation saved' });
  } catch (err) {
    console.error('❌ Failed to save donation:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ TEMP: See all donations (for dev/debug only)
router.get('/donations/all', async (req, res) => {
  try {
    const donations = await Donation.find({});
    res.json(donations);
  } catch (err) {
    console.error('❌ Error fetching donations:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
