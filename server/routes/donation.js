// routes/donations.js
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Donation = require('../models/Donation');
const { generateReceiptPDF } = require('../utils/pdfReceipt');
const path = require('path');
const fs = require('fs');
const { sendThankYouEmail } = require('../utils/mailer');
const User = require('../models/user');
console.log("🧪 sendThankYouEmail type:", typeof sendThankYouEmail);



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

    // ✅ Check if user still exists (prevents deleted/banned users from donating)
    const user = await User.findById(session.metadata.userId);
    if (!user) {
      console.log("❌ User not found, donation blocked for userId:", session.metadata.userId);
      return res.status(403).json({ 
        error: 'User account not found. You may have been banned or your account deleted.',
        message: 'Donation blocked - user account not found'
      });
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

    // ✅ Send email with PDF
    // Fetch donor name from User model (user already fetched above)
    let donorName = 'N/A';
    if (user && user.name) donorName = user.name;

    const donationData = {
      email: session.customer_email || session.customer_details?.email || 'default@example.com',
      campaignTitle: session.metadata.campaignTitle,
      amount: session.amount_total / 100,
      currency: session.currency,
      date: new Date(),
      sessionId: session.id,
      name: donorName,
    };

    const pdfPath = path.join(__dirname, '..', 'temp', `${session.id}.pdf`);
    await generateReceiptPDF(donationData, pdfPath);
    await sendThankYouEmail(donationData.email, donationData.campaignTitle, donationData.amount, pdfPath);
    fs.unlink(pdfPath, () => {}); // optional cleanup

    console.log("✅ Donation saved and email sent for session:", session.id);
    res.status(200).json({ message: 'Donation saved and email sent' });

  } catch (err) {
    console.error('❌ Failed to save donation:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Get all donations by a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const donations = await Donation.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(donations);
  } catch (err) {
    console.error('❌ Error fetching user donations:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
