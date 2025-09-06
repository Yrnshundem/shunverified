import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Signup.css';
import api from '../api';

function Signup({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/api/auth/signup', { email, password });
      if (res.data.token && res.data.userId && res.data.credits) {
        onLogin(res.data.token, res.data.userId, res.data.credits);
      } else {
        throw new Error('Incomplete signup response');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Signup failed';
      setError(errorMsg);
      console.error('Signup error:', error.response?.data || error.message);
    }
  };

  return (
    <div className="signup-container">
      <h2 className="signup-title">Sign Up for ShunVerified</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="signup-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
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
      <p className="login-link">
        Already have an account? <Link to="/login" className="login-link-text">Login</Link>
      </p>
    </div>
  );
}

export default Signup;
