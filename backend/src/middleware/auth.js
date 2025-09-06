const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expect "Bearer <token>"

  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure JWT_SECRET is in .env
    req.user = await User.findById(decoded.userId).select('-password'); // Exclude password
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token.' });
  }
};

module.exports = authenticateToken;
