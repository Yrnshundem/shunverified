const mongoose = require('mongoose');

const SMSLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  phoneNumber: { type: String, required: true },
  service: { type: String, required: true },
  message: { type: String, required: true },
  activationId: { type: String },
  isDelivered: { type: Boolean, default: false },
  receivedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SMSLog', SMSLogSchema);