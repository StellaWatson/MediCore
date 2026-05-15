/**
 * api.js - Axios instance pre-configured for CareTrack MRMS API
 * Automatically attaches JWT token to every request.
 */
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mrms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally - redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('mrms_token');
      localStorage.removeItem('mrms_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
