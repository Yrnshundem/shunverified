const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Use the central model definition

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, credits: 0 }); // Initialize credits
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });
    res.status(201).json({ token, userId: user._id, credits: user.credits });
  } catch (error) {
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token, userId: user._id, credits: user.credits });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get user info (credits)
router.get('/user/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('credits');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ credits: user.credits });
  } catch (error) {
    res.status(500).json({ error: 'Fetch user failed' });
  }
});

module.exports = router;
