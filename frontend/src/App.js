
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Signup from './components/Signup';
import Deposit from './components/Deposit';
import Dashboard from './components/Dashboard';
import RentNumber from './components/RentNumber';
import api from './api';

// Placeholder components
const Terms = () => <div className="content-area"><h2>Terms of Service</h2><p>Terms content here.</p></div>;
const Privacy = () => <div className="content-area"><h2>Privacy Policy</h2><p>Privacy content here.</p></div>;

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [credits, setCredits] = useState(parseInt(localStorage.getItem('credits')) || 0);
  const [loading, setLoading] = useState(false);

  const handleLogin = (newToken, newUserId, newCredits) => {
    setLoading(true);
    setToken(newToken);
    setUserId(newUserId);
    setCredits(newCredits);
    localStorage.setItem('token', newToken);
    localStorage.setItem('userId', newUserId);
    localStorage.setItem('credits', newCredits);
    setLoading(false);
  };

  const handleLogout = () => {
    setLoading(true);
    setToken(null);
    setUserId(null);
    setCredits(0);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('credits');
    setLoading(false);
    window.location.href = '/';
  };

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
          .catch(err => console.error('Error fetching credits:', err.response?.data || err.message));
      }, 60000);
    }
    return () => clearInterval(interval);
  }, [userId, token, credits]);

  return (
    <Router>
      <div className="app-wrapper">
        <header className="app-header">
          <h1 className="app-logo">ShunVerified</h1>
          {token && <p className="credits-display">Credits: {credits}</p>}
        </header>
        <div className="main-content">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : token ? (
            <div className="dashboard-layout">
              <aside className="sidebar">
                <nav className="sidebar-nav">
                  <Link to="/" className="nav-item">Dashboard</Link>
                  <Link to="/deposit" className="nav-item">Deposit</Link>
                  <Link to="/rent" className="nav-item">Rent Number</Link>
                  <button onClick={handleLogout} className="nav-item logout-btn">Logout</button>
                </nav>
              </aside>
              <main className="content-area fade-in">
                <Routes>
                  <Route path="/" element={<Dashboard userId={userId} token={token} setCredits={setCredits} />} />
                  <Route path="/deposit" element={<Deposit userId={userId} token={token} setCredits={setCredits} />} />
                  <Route path="/rent" element={<RentNumber userId={userId} token={token} setCredits={setCredits} />} />
                </Routes>
              </main>
            </div>
          ) : (
<div className="auth-container fade-in">
  <Routes>
    <Route
      path="/login"
      element={<Login onLogin={handleLogin} />}
    />
    <Route
      path="/signup"
      element={<Signup onLogin={handleLogin} />}
    />
    <Route
      path="/terms"
      element={<Terms />}
    />
    <Route
      path="/privacy"
      element={<Privacy />}
    />
    <Route
      path="/"
      element={<Login onLogin={handleLogin} />}
    />
    <Route
      path="*"
      element={<div className="content-area"><h2>Page Not Found</h2></div>}
    /> {/* Catch-all for undefined routes */}
  </Routes>
</div>
        <footer className="app-footer">
          <p>© 2025 ShunVerified. All rights reserved. | <a href="/terms">Terms</a> | <a href="/privacy">Privacy</a></p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
