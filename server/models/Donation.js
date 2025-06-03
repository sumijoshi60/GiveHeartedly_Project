// server/models/Donation.js
const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  email: String,
  amount: Number,
  currency: String,
  paymentStatus: String,
  sessionId: String,
  campaignTitle: String,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Donation", donationSchema);
