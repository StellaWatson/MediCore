/**
 * api.js - Fetch API instance pre-configured for CareTrack MRMS API
 * Replaces Axios, keeping response interfaces identical.
 * Automatically attaches JWT token to every request.
 */

const baseURL = '/api';

const customFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('mrms_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseURL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('mrms_token');
    localStorage.removeItem('mrms_user');
    window.location.href = '/login';
    return Promise.reject(new Error('Unauthorized'));
  }

  const contentType = response.headers.get('content-type');
  let data = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const error = new Error(`Request failed with status ${response.status}`);
    error.response = { status: response.status, data };
    throw error;
  }

  return { data, status: response.status, headers: response.headers };
};

const api = {
  get: (url, config) => customFetch(url, { method: 'GET', ...config }),
  post: (url, body, config) => customFetch(url, { method: 'POST', body: JSON.stringify(body), ...config }),
  put: (url, body, config) => customFetch(url, { method: 'PUT', body: JSON.stringify(body), ...config }),
  delete: (url, config) => customFetch(url, { method: 'DELETE', ...config }),
};

export default api;
