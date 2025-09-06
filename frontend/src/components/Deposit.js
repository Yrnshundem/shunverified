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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/api/payments/deposit-info', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setDepositInfo(res.data);
        setError('');
      })
      .catch(err => {
        setError(`Failed to load deposit info: ${err.response?.data?.message || err.message}`);
        console.error('Deposit info error:', err.response?.data || err.message);
      })
      .finally(() => setLoading(false));
  }, [token]);

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
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/payments/deposit', { userId, amount: parseFloat(amount), currency, txId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(res.data.message);
      setAmount('');
      setTxId('');
      const userRes = await api.get(`/api/auth/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCredits(userRes.data.credits);
      localStorage.setItem('credits', userRes.data.credits);
    } catch (error) {
      setError(`Failed to submit deposit: ${error.response?.data?.error || error.message}`);
      console.error('Deposit submit error:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="deposit-container">
      <h2 className="deposit-title">Deposit to ShunVerified</h2>
      {error && <p className="error-message">{error}</p>}
      {loading ? <p className="loading-message">Loading deposit info...</p> : (
        <>
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
          <p className="address-label">MoMo Number (MTN): 0248536079 - ONYX Base (Martha)</p>
          <p className="info-text">Credits will be added after verification (10-60 minutes).</p>
        </>
      )}
      <form onSubmit={handleSubmit} className="deposit-form">
        <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="deposit-select">
          <option value="bitcoin">BTC</option>
          <option value="tether">USDT</option>
          <option value="momo">MoMo</option>
        </select>
        <input type="number" placeholder="Amount (e.g., 0.001 BTC)" value={amount} onChange={(e) => setAmount(e.target.value)} required className="deposit-input" />
        <input type="text" placeholder="Transaction ID" value={txId} onChange={(e) => setTxId(e.target.value)} required className="deposit-input" />
        <button type="submit" className="deposit-btn" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Deposit'}
        </button>
      </form>
      <p className="pricing-info">Pricing: $1 = 1 credit, $10 = 12 credits</p>
    </div>
  );
}

export default Deposit;
