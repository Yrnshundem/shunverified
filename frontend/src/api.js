import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://shunverified.onrender.com';

const isDevelopment = process.env.NODE_ENV === 'development';
const baseURL = isDevelopment ? 'http://localhost:5000' : API_URL;

const api = axios.create({
  baseURL: baseURL || '',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
