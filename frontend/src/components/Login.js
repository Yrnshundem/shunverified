import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';
import api from '../api';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    try {
      const res = await api.post('/api/login', { email, password }); // Adjusted endpoint
      if (res.data.token && res.data.userId && res.data.credits) {
        onLogin(res.data.token, res.data.userId, res.data.credits);
      } else {
        throw new Error('Incomplete login response');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Invalid email or password';
      setError(errorMsg);
      console.error('Login error:', error.response?.data || error.message);
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Login to ShunVerified</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="login-form">
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
        <button type="submit" className="login-btn">Login</button>
      </form>
      <p className="signup-link">
        Don't have an account? <Link to="/signup" className="signup-link-text">Sign Up</Link>
      </p>
    </div>
  );
}

export default Login;