import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/admin';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Public endpoints
  getMarkers: () => api.get('/markers'),
  getUpdates: () => api.get('/updates'),
  getDonations: () => api.get('/donations'),

  // Admin endpoints
  login: (credentials) => api.post('/admin/login', credentials),
  
  // Updates management
  addUpdate: (data) => api.post('/admin/update', data),
  editUpdate: (id, data) => api.put(`/admin/update/${id}`, data),
  deleteUpdate: (id) => api.delete(`/admin/update/${id}`),
  
  // Markers management
  addMarker: (data) => api.post('/admin/marker', data),
  editMarker: (id, data) => api.put(`/admin/marker/${id}`, data),
  deleteMarker: (id) => api.delete(`/admin/marker/${id}`),
};

export default api;
