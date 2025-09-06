const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = mongoose.model('User', new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}));

router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });
    const user = new User({ email, password: await bcrypt.hash(password, 10) });
    await user.save();
    res.status(201).json({ message: 'Signup successful', token: jwt.sign({ id: user._id }, 'your_jwt_secret') });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;