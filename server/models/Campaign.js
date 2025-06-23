const mongoose = require('mongoose');

// 🛠️ Clear the cached model in development to apply schema changes
if (mongoose.models.Campaign) {
  delete mongoose.models.Campaign;
}

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
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ended: {
    type: Boolean,
    default: false,
  },
  endedAt: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model('Campaign', CampaignSchema);
