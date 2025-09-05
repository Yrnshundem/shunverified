import axios from 'axios';

// Use REACT_APP_API_URL (consistent with Vercel settings)
const API_URL = process.env.REACT_APP_API_URL;

// Fallback to localhost only if in development mode
const isDevelopment = process.env.NODE_ENV === 'development';
const baseURL = isDevelopment ? 'http://localhost:5000' : API_URL;

const api = axios.create({
  baseURL: baseURL || '', // Ensure no undefined baseURL in production
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
