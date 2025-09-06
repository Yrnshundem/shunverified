import React, { useState, useEffect } from 'react';
import api from '../api';

const RentNumber = () => {
  const [selectedService, setSelectedService] = useState('wa');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [activationId, setActivationId] = useState('');

  const services = { wa: 'WhatsApp', ti: 'Tinder', vk: 'VK' };

  const requestNumber = async () => {
    const response = await api.post('/request-number', { service: selectedService, maxPrice: 20 });
    setPhone(response.data.phone);
    setActivationId(response.data.activationId);
  };

  useEffect(() => {
    let interval;
    if (phone) {
      interval = setInterval(async () => {
        const response = await api.get('/check-sms', { params: { activationId } });
        if (response.data.code) {
          setCode(response.data.code);
          clearInterval(interval);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [phone, activationId]);

  const releaseNumber = async () => {
    await api.post('/release-number', { activationId });
    setPhone('');
    setCode('');
    setActivationId('');
  };

  return (
    <div>
      <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
        {Object.entries(services).map(([code, name]) => (
          <option key={code} value={code}>{name}</option>
        ))}
      </select>
      <button onClick={requestNumber}>Get Number</button>
      {phone && <p>Your number: {phone}</p>}
      {code && <p>Your code: {code}</p>}
      {code && <button onClick={releaseNumber}>Release Number</button>}
    </div>
  );
};

export default RentNumber;