import axios from 'axios';

// REACT_APP_API_URL = backend URL (set in Railway if frontend/backend separate). Empty = same origin.
export const apiBaseUrl =
  typeof process !== 'undefined' && process.env.REACT_APP_API_URL != null && process.env.REACT_APP_API_URL !== ''
    ? process.env.REACT_APP_API_URL
    : '';

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

