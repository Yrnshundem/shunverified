import React, { useState, useEffect } from 'react';
import api from '../api';
import './RentNumber.css';

const RentNumber = ({ userId, token, setCredits }) => {
  const [selectedService, setSelectedService] = useState('wa');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [activationId, setActivationId] = useState('');
  const [error, setError] = useState('');
  const [credits, setLocalCredits] = useState(localStorage.getItem('credits') || 0);
  const [loading, setLoading] = useState(false);

  const services = {
    wa: { name: 'WhatsApp', desc: 'Verify your WhatsApp account securely.' },
    ti: { name: 'Tinder', desc: 'Get a number for Tinder verification.' },
    vk: { name: 'VK', desc: 'Use a number for VK social media signup.' }
  };

  const requestNumber = async () => {
    if (!token) {
      setError('Please log in to rent a number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/api/request-number', { service: selectedService, maxPrice: 20 }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.phone && response.data.activationId) {
        setPhone(response.data.phone);
        setActivationId(response.data.activationId);
        const userRes = await api.get(`/api/auth/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLocalCredits(userRes.data.credits);
        setCredits(userRes.data.credits);
        localStorage.setItem('credits', userRes.data.credits);
      } else {
        setError('Failed to request number: Invalid response');
      }
    } catch (err) {
      setError(`Failed to request number: ${err.response?.data?.message || err.message}`);
      console.error('Request error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval;
    if (phone && activationId && token) {
      interval = setInterval(async () => {
        try {
          const response = await api.get('/api/check-sms', {
            params: { activationId },
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data.code) {
            setCode(response.data.code);
            clearInterval(interval);
          }
        } catch (err) {
          setError(`Failed to check SMS: ${err.response?.data?.message || err.message}`);
          console.error('Check SMS error:', err.response?.data || err.message);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [phone, activationId, token]);

  const releaseNumber = async () => {
    setLoading(true);
    try {
      await api.post('/api/release-number', { activationId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPhone('');
      setCode('');
      setActivationId('');
      setError('');
    } catch (err) {
      setError(`Failed to release number: ${err.response?.data?.message || err.message}`);
      console.error('Release error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rent-container">
      <h2 className="rent-title">Rent a Verification Number</h2>
      {error && <p className="error-message">{error}</p>}
      <div className="rent-form">
        <div className="service-tooltip">
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="rent-select"
          >
            {Object.entries(services).map(([code, { name }]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
          <span className="tooltip-text">{services[selectedService].desc}</span>
        </div>
        <button onClick={requestNumber} className="rent-btn" disabled={loading || !token || credits < 1}>
          {loading ? <div className="loading-spinner"></div> : 'Get Number (1 Credit)'}
        </button>
        {phone && <p className="rent-success">Your number: {phone}</p>}
        {code && <p className="rent-success">Your code: {code}</p>}
        {code && <button onClick={releaseNumber} className="rent-btn">Release Number</button>}
        {token && <p className="credits-display">Credits: {credits}</p>}
      </div>
    </div>
  );
};

export default RentNumber;
