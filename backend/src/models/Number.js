const mongoose = require('mongoose');

const NumberSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true },
  service: { type: String, required: true },
  status: { type: String, enum: ['available', 'in-use', 'expired'], default: 'available' },
  price: { type: Number, required: true },
  activationId: { type: String }, // For SMS-Activate tracking
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  expirationTime: { type: Date } // Optional expiration
});

module.exports = mongoose.model('Number', NumberSchema);