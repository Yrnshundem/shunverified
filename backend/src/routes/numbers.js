const express = require('express');
const router = express.Router();
const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const User = require('../models/User');

let rentedNumbers = {}; // { userId: { phoneNumber, service, timestamp } }
let smsLogs = []; // Array of { userId, service, message, phoneNumber, receivedAt }

router.post('/rent', async (req, res) => {
  const { userId, service } = req.body;
  const user = await User.findById(userId);

  if (!user) {
    return res.status(400).json({ message: 'User not found.' });
  }
  if (user.credits < 10) {
    return res.status(400).json({ message: 'Insufficient credits. Minimum 10 required.' });
  }

  const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!twilioNumber) {
    return res.status(400).json({ message: 'No number configured.' });
  }

  rentedNumbers[userId] = { phoneNumber: twilioNumber, service, timestamp: Date.now() + 15 * 60 * 1000 }; // 15-min timeout
  user.credits -= 10;
  await user.save();

  res.json({ phoneNumber: twilioNumber, message: 'Number rented. Paste it into the app to receive a code.' });
});

router.post('/sms-webhook', (req, res) => {
  const { From, Body } = req.body;
  const userId = Object.keys(rentedNumbers).find(id => rentedNumbers[id].phoneNumber === process.env.TWILIO_PHONE_NUMBER && Date.now() < rentedNumbers[id].timestamp);
  if (userId) {
    const log = {
      userId,
      service: rentedNumbers[userId].service || 'Unknown',
      message: Body,
      phoneNumber: From,
      receivedAt: new Date()
    };
    smsLogs.push(log);
    console.log(`Received SMS for ${userId} from ${From}: ${Body}`);
  } else {
    console.log(`Unassigned SMS from ${From}: ${Body}`);
  }
  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end('<Response></Response>');
});

router.get('/sms/all', async (req, res) => {
  const { userId } = req.query;
  const userLogs = smsLogs.filter(log => log.userId === userId);
  res.json({ logs: userLogs });
});

module.exports = router;