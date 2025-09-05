import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import api from '../api';

function Dashboard({ userId, token }) {
  const [smsLogs, setSmsLogs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId || !token) return;

    api.get(`/api/numbers/sms/all?userId=${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (Array.isArray(res.data.logs)) {
          setSmsLogs(res.data.logs);
        } else {
          setSmsLogs([]);
        }
      })
      .catch(err => setError('Failed to load SMS logs'));
  }, [userId, token]);

  const latestCode = smsLogs.length > 0 ? smsLogs[smsLogs.length - 1].message : null;
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (latestCode) {
      navigator.clipboard.writeText(latestCode).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">ShunVerified Dashboard</h2>
      {error && <p className="error-message">{error}</p>}
      <nav className="dashboard-nav">
        <Link to="/deposit" className="nav-link">Deposit Credits</Link> | 
        <Link to="/rent" className="nav-link">Rent Number</Link>
      </nav>
      <h3 className="sms-title">Received SMS</h3>
      {smsLogs.length === 0 ? (
        <p className="no-sms-message">No SMS received yet.</p>
      ) : (
        <ul className="sms-list">
          {smsLogs.map((log, index) => (
            <li key={index} className="sms-item">
              {log.service || 'Unknown'}: {log.message || 'No message'} ({log.phoneNumber || 'Unknown'}) - {log.receivedAt ? new Date(log.receivedAt).toLocaleString() : 'Unknown time'}
            </li>
          ))}
        </ul>
      )}
      {latestCode && (
        <div className="code-section">
          <p>Latest Code: {latestCode}</p>
          <button onClick={handleCopyCode} className="copy-btn">
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>
      )}
    </div>
  );
}

export default Dashboard;