const express = require('express');
const axios = require('axios');
const Number = require('../models/Number');
const SMSLog = require('../models/SMSLog');
const User = require('../models/User');
const router = express.Router();

const API_KEY = process.env.SMS_ACTIVATE_API_KEY;
const BASE_URL = 'https://api.sms-activate.ae/stubs/handler_api.php';

router.post('/rent', async (req, res) => {
  const { userId, service, maxPrice } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ message: 'User not found' });
    if (user.credits < 10) return res.status(400).json({ message: 'Insufficient credits. Minimum 10 required' });

    const response = await axios.get(BASE_URL, {
      params: {
        api_key: API_KEY,
        action: 'getNumber',
        service: `${service}_0`,
        country: 0,
        maxPrice: maxPrice || 10,
      },
    });
    const data = response.data;
    if (data.status === 'success') {
      const number = new Number({
        phoneNumber: data.phone,
        service,
        price: data.price || maxPrice || 10,
        activationId: data.activationId,
        userId,
        status: 'in-use',
        expirationTime: new Date(Date.now() + 15 * 60 * 1000),
      });
      await number.save();
      user.credits -= number.price;
      await user.save();
      res.json({ phoneNumber: data.phone, activationId: data.activationId, message: 'Number rented' });
    } else {
      res.status(400).json({ message: data.message });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/check-sms', async (req, res) => {
  const { activationId } = req.query;
  try {
    const response = await axios.get(BASE_URL, {
      params: { api_key: API_KEY, action: 'getStatus', id: activationId },
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

router.post('/release', async (req, res) => {
  const { activationId } = req.body;
  try {
    const response = await axios.get(BASE_URL, {
      params: { api_key: API_KEY, action: 'setStatus', id: activationId, status: 8 },
    });
    await Number.findOneAndUpdate({ activationId }, { status: 'expired' });
    res.json({ message: response.data });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/sms/all', async (req, res) => {
  const { userId } = req.query;
  try {
    const logs = await SMSLog.find({ userId }).sort({ receivedAt: -1 });
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;