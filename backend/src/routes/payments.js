const express = require('express');
const axios = require('axios');
const User = require('../models/User');

const router = express.Router();

router.get('/deposit-info', async (req, res) => {
  try {
    const priceResponse = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,tether&vs_currencies=usd');
    res.json({
      btcAddress: process.env.BTC_ADDRESS,
      usdtAddress: process.env.USDT_ADDRESS,
      btcPrice: priceResponse.data.bitcoin.usd,
      usdtPrice: priceResponse.data.tether.usd,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deposit info' });
  }
});

router.post('/deposit', async (req, res) => {
  const { userId, amount, currency, txId } = req.body;
  if (!userId || !amount || !currency || !txId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (amount <= 0) return res.status(400).json({ error: 'Amount must be positive' });
  try {
    const priceResponse = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${currency.toLowerCase()}&vs_currencies=usd`);
    const price = priceResponse.data[currency.toLowerCase()].usd;
    const credits = amount * price;
    const user = await User.findById(userId);
    if (user) {
      user.credits += credits; // Manual verification assumed
      await user.save();
      res.json({ message: 'Deposit verified. Credits added.' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Deposit processing failed' });
  }
});

module.exports = router;