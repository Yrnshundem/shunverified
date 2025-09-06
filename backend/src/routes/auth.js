const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Use the central model definition

const router = express.Router();

// Middleware for input validation
const validateInput = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  next();
};

// Signup
router.post('/signup', validateInput, async (req, res) => {
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
    console.error('Signup error:', error); // Log for debugging
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Login
router.post('/login', validateInput, async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token, userId: user._id, credits: user.credits });
  } catch (error) {
    console.error('Login error:', error); // Log for debugging
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
    console.error('User fetch error:', error); // Log for debugging
    res.status(500).json({ error: 'Fetch user failed' });
  }
});

module.exports = router;
