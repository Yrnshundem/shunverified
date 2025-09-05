import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Signup from './components/Signup';
import Deposit from './components/Deposit';
import Dashboard from './components/Dashboard';
import RentNumber from './components/RentNumber';
import api from './api'; // Assuming api is in src/api.js

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [credits, setCredits] = useState(localStorage.getItem('credits') || 0);

  const handleLogin = (newToken, newUserId, newCredits) => {
    setToken(newToken);
    setUserId(newUserId);
    setCredits(newCredits);
    localStorage.setItem('token', newToken);
    localStorage.setItem('userId', newUserId);
    localStorage.setItem('credits', newCredits);
  };

  const handleLogout = () => {
    setToken(null);
    setUserId(null);
    setCredits(0);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('credits');
    // Force a re-render to ensure login page shows
    window.location.href = '/'; // Redirect to root to trigger login route
  };

  // Real-time credit update
  useEffect(() => {
    let interval;
    if (userId && token) {
      interval = setInterval(() => {
        api.get(`/api/auth/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => {
            const newCredits = res.data.credits;
            if (newCredits !== credits) {
              setCredits(newCredits);
              localStorage.setItem('credits', newCredits);
            }
          })
          .catch(err => console.log('Error fetching credits:', err));
      }, 60000); // Check every minute
    }
    return () => clearInterval(interval); // Cleanup on unmount or state change
  }, [userId, token, credits]); // Dependencies

  return (
    <Router>
      <div className="app-container">
        <h1 className="app-title">ShunVerified</h1>
        {token ? (
          <div className="content-container">
            <div className="user-info">
              <p>Credits: {credits}</p>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
            <nav className="nav-links">
              <Link to="/" className="nav-link">Dashboard</Link> |
              <Link to="/deposit" className="nav-link">Deposit</Link> |
              <Link to="/rent" className="nav-link">Rent Number</Link>
            </nav>
            <Routes>
              <Route path="/" element={<Dashboard userId={userId} token={token} setCredits={setCredits} />} />
              <Route path="/deposit" element={<Deposit userId={userId} token={token} setCredits={setCredits} />} />
              <Route path="/rent" element={<RentNumber userId={userId} token={token} setCredits={setCredits} />} />
            </Routes>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Login onLogin={handleLogin} />} />
            <Route path="/signup" element={<Signup onLogin={handleLogin} />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;