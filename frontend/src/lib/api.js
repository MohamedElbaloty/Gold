import axios from 'axios';

// Same origin in production (backend serves frontend); localhost:5000 in dev
export const apiBaseUrl = typeof process !== 'undefined' && process.env?.REACT_APP_API_URL !== undefined
  ? process.env.REACT_APP_API_URL
  : (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');

export const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // keep compatibility with backend middleware
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

