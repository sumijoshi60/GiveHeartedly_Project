const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String, // ⚠️ In production, hash passwords!
  campaignsCreated: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' }],
  donationsMade: [
    {
      campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
      amount: Number,
      date: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('User', UserSchema);
