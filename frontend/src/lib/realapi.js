// src/realApi.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Example endpoints (add your own as your backend grows)
export const students = {
  list: () => api.get('/students'),
  get: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  remove: (id) => api.delete(`/students/${id}`),
};

export const consultants = {
  list: () => api.get('/consultants'),
  create: (data) => api.post('/consultants', data),
  remove: (id) => api.delete(`/consultants/${id}`),
};

export const leads = {
  list: () => api.get('/leads'),
  create: (data) => api.post('/leads', data),
};

export const documents = {
  list: () => api.get('/documents'),
  create: (data) => api.post('/documents', data),
  remove: (id) => api.delete(`/documents/${id}`),
};

export const messages = {
  list: () => api.get('/messages'),
  create: (data) => api.post('/messages', data),
};

export const threads = {
  listForUser: (userId) => api.get(`/threads/${userId}`),
  get: (id) => api.get(`/threads/${id}`),
};

export default {
  students,
  leads,
  consultants,
  documents,
  messages,
  threads,
};
