const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const loginRouter = require('./routes/login');
const signupRouter = require('./routes/signup');
const app = express();

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use('/api', loginRouter);
app.use('/api', signupRouter);

const API_KEY = process.env.SMS_ACTIVATE_API_KEY;
const BASE_URL = 'https://api.sms-activate.ae/stubs/handler_api.php';

app.post('/api/request-number', async (req, res) => {
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
      res.json({ phone: data.phone, activationId: data.activationId });
    } else {
      res.status(400).json({ message: data.message });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/check-sms', async (req, res) => {
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
      res.json({ code: data.smsCode[0], text: data.smsText });
    } else {
      res.json({ status: data.status });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/release-number', async (req, res) => {
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
    res.json({ message: response.data });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(process.env.PORT || 5000);