import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import './Deposit.css';
import api from '../api';

function Deposit({ userId, token, setCredits }) {
  const [depositInfo, setDepositInfo] = useState({});
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('bitcoin');
  const [txId, setTxId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/payments/deposit-info')
      .then(res => setDepositInfo(res.data))
      .catch(err => setError('Failed to load deposit info'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!txId) {
      setError('Please enter a transaction ID');
      return;
    }
    try {
      const res = await api.post('/api/payments/deposit', { userId, amount: parseFloat(amount), currency, txId });
      alert(res.data.message);
      setAmount('');
      setTxId('');
      setError('');
      const userRes = await api.get(`/api/auth/user/${userId}`);
      setCredits(userRes.data.credits);
      localStorage.setItem('credits', userRes.data.credits);
    } catch (error) {
      setError('Failed to submit deposit');
    }
  };

  return (
    <div className="deposit-container">
      <h2 className="deposit-title">Deposit to ShunVerified</h2>
      {error && <p className="error-message">{error}</p>}
      <p className="address-label">BTC Address: {depositInfo.btcAddress}</p>
      {depositInfo.btcAddress && (
        <div className="qr-code-container">
          <QRCode value={depositInfo.btcAddress} size={128} />
        </div>
      )}
      <p className="address-label">USDT Address (BEP-20): {depositInfo.usdtAddress}</p>
      {depositInfo.usdtAddress && (
        <div className="qr-code-container">
          <QRCode value={depositInfo.usdtAddress} size={128} />
        </div>
      )}
      <p className="info-text">Credits will be added after verification (10-60 minutes).</p>
      <form onSubmit={handleSubmit} className="deposit-form">
        <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="deposit-select">
          <option value="bitcoin">BTC</option>
          <option value="tether">USDT</option>
        </select>
        <input type="number" placeholder="Amount (e.g., 0.001 BTC)" value={amount} onChange={(e) => setAmount(e.target.value)} required className="deposit-input" />
        <input type="text" placeholder="Transaction ID" value={txId} onChange={(e) => setTxId(e.target.value)} required className="deposit-input" />
        <button type="submit" className="deposit-btn">Submit Deposit</button>
      </form>
    </div>
  );
}

export default Deposit;