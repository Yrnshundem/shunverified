import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';
import api from '../api';

function Signup({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // New state for toggle
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/auth/signup', { email, password });
      const res = await api.post('/api/auth/login', { email, password });
      onLogin(res.data.token, res.data.userId, res.data.credits);
      navigate('/');
    } catch (error) {
      setError('Signup failed, email may already exist');
    }
  };

  return (
    <div className="signup-container">
      <h2 className="signup-title">Sign Up for ShunVerified</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="signup-form">
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <div className="password-container">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            /> Show Password
          </label>
        </div>
        <button type="submit" className="signup-btn">Sign Up</button>
      </form>
    </div>
  );
}

export default Signup;