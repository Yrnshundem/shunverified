import React, { useState, useEffect } from 'react';
import './RentNumber.css';
import api from '../api';

function RentNumber({ userId, token, setCredits }) {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [phone, setPhone] = useState('');
  const [activationId, setActivationId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/api/numbers/services', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setServices(res.data.services || []);
        setError('');
      })
      .catch(err => {
        setError(`Failed to load services: ${err.response?.data?.message || err.message}`);
        console.error('Services error:', err.response?.data || err.message);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleRent = async (e) => {
    e.preventDefault();
    if (!selectedService) {
      setError('Please select a service');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/request-number', { service: selectedService, maxPrice }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPhone(res.data.phone);
      setActivationId(res.data.activationId);
      const userRes = await api.get(`/api/auth/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCredits(userRes.data.credits);
      localStorage.setItem('credits', userRes.data.credits);
    } catch (error) {
      setError(`Failed to request number: ${error.response?.data?.message || error.message}`);
      console.error('Rent number error:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rent-container">
      <h2 className="rent-title">Rent a Number</h2>
      {error && <p className="error-message">{error}</p>}
      {loading ? <p className="loading-message">Loading services...</p> : (
        <form onSubmit={handleRent} className="rent-form">
          <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)} className="rent-select" required>
            <option value="">Select a service</option>
            {services.map(service => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Max Price (optional)"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="rent-input"
          />
          <button type="submit" className="rent-btn" disabled={loading}>
            {loading ? 'Requesting...' : 'Get Number (1 credit)'}
          </button>
          {phone && <p className="rent-phone">Phone: {phone} (Activation ID: {activationId})</p>}
        </form>
      )}
    </div>
  );
}

export default RentNumber;
