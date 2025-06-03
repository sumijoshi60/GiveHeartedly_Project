const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
  title: String,
  goal: Number,
  location: String,
  description: String,
  category: String,
  imageUrl: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Campaign', CampaignSchema);
