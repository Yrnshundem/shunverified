const mongoose = require('mongoose');

const NumberSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true },
  service: { type: String, required: true },
  status: { type: String, enum: ['available', 'in-use', 'expired'], default: 'available' },
  price: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Number', NumberSchema);