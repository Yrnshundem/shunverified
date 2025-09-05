import React, { useState, useEffect } from 'react';
import './RentNumber.css';
import api from '../api';

function RentNumber({ userId, token, credits, setCredits }) {
  const [service, setService] = useState('Google');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (credits < 10) {
      setError('Insufficient credits. Minimum 10 required to rent a number.');
    } else if (error === 'Insufficient credits...') {
      setError(''); // Clear error if credits are restored
    }
  }, [credits]);

  const handleRent = async (e) => {
    e.preventDefault();
    if (!userId || !token || credits < 10) {
      setError('Insufficient credits or user not authenticated.');
      return;
    }

    try {
      const res = await api.post('/api/numbers/rent', { userId, service }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPhoneNumber(res.data.phoneNumber || '');
      setError('');
      const userRes = await api.get(`/api/auth/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCredits(userRes.data.credits);
      localStorage.setItem('credits', userRes.data.credits);
    } catch (error) {
      setError('Failed to rent number.');
      console.error('Rent error:', error.response?.data || error.message);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(phoneNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="rent-container">
      <h2 className="rent-title">Rent a Number - ShunVerified</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleRent} className="rent-form">
        <select value={service} onChange={(e) => setService(e.target.value)} className="rent-select" disabled={credits < 10}>
          <option value="Google">Google</option>
          <option value="WhatsApp">WhatsApp</option>
          <option value="Facebook">Facebook</option>
          <option value="POF">POF (Plenty of Fish)</option>
          <option value="Tinder">Tinder</option>
          <option value="Bumble">Bumble</option>
          <option value="Hinge">Hinge</option>
          <option value="OkCupid">OkCupid</option>
          <option value="Match">Match</option>
          <option value="eHarmony">eHarmony</option>
          <option value="CoffeeMeetsBagel">Coffee Meets Bagel</option>
          <option value="Feeld">Feeld</option>
          <option value="Happn">Happn</option>
          <option value="Kippo">Kippo</option>
          <option value="Clover">Clover</option>
          <option value="TheLeague">The League</option>
          <option value="Hily">Hily</option>
        </select>
        <button type="submit" className="rent-btn" disabled={credits < 10}>Rent Number</button>
      </form>
      {phoneNumber && (
        <div className="rent-success">
          <p>Your number: {phoneNumber}</p>
          <button onClick={handleCopy} className="copy-btn">
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <p>Paste this number into the app to receive a code, then check the dashboard.</p>
        </div>
      )}
    </div>
  );
}

export default RentNumber;