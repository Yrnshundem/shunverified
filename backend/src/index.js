const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const authRouter = require('./routes/auth');
const numbersRouter = require('./routes/numbers');
const paymentsRouter = require('./routes/payments');
const Number = require('./models/Number');
const SMSLog = require('./models/SMSLog');
const User = require('./models/User');
const app = express();

app.use(express.json());

// Middleware to authenticate user
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRouter);
app.use('/api/numbers', numbersRouter);
app.use('/api/payments', paymentsRouter);

const API_KEY = process.env.SMS_ACTIVATE_API_KEY;
const BASE_URL = 'https://api.sms-activate.ae/stubs/handler_api.php';
const jwt = require('jsonwebtoken');

app.post('/api/request-number', authenticateToken, async (req, res) => {
  const { service, maxPrice } = req.body;
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        api_key: API_KEY,
        action: 'getNumber',
        service: `${service}_0`,
        country: 0,
        maxPrice: maxPrice || undefined,
      },
    });
    const data = response.data;
    if (data.status === 'success') {
      const number = new Number({
        phoneNumber: data.phone,
        service,
        price: data.price || maxPrice,
        activationId: data.activationId,
        userId: req.user.userId,
        status: 'in-use',
        expirationTime: new Date(Date.now() + 15 * 60 * 1000),
      });
      await number.save();
      const user = await User.findById(req.user.userId);
      if (user.credits >= number.price) {
        user.credits -= number.price;
        await user.save();
        res.json({ phone: data.phone, activationId: data.activationId });
      } else {
        await number.remove();
        res.status(400).json({ message: 'Insufficient credits' });
      }
    } else {
      res.status(400).json({ message: data.message });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/check-sms', authenticateToken, async (req, res) => {
  const { activationId } = req.query;
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        api_key: API_KEY,
        action: 'getStatus',
        id: activationId,
      },
    });
    const data = response.data;
    if (data.status === 'success' && data.smsCode) {
      const number = await Number.findOne({ activationId });
      const smsLog = new SMSLog({
        userId: number.userId,
        phoneNumber: data.phoneNumber || number.phoneNumber,
        service: number.service,
        message: data.smsText,
        activationId,
      });
      await smsLog.save();
      res.json({ code: data.smsCode[0], text: data.smsText });
    } else {
      res.json({ status: data.status });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/release-number', authenticateToken, async (req, res) => {
  const { activationId } = req.body;
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        api_key: API_KEY,
        action: 'setStatus',
        id: activationId,
        status: 8,
      },
    });
    await Number.findOneAndUpdate({ activationId }, { status: 'expired' });
    res.json({ message: response.data });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});