const mongoose = require('mongoose');

const WithdrawalSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['paypal', 'stripe', 'bank']
  },
  accountName: {
    type: String,
    required: true
  },
  accountNumber: {
    type: String,
    required: true
  },
  purpose: String,
  email: String,
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'processed', 'failed']
  },
  withdrawnAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Withdrawal', WithdrawalSchema); 