import api from './api';

export const assignmentService = {
  getAll: () => api.get('/assignments'),
  getMy: () => api.get('/assignments/my'),
  getById: (id) => api.get(`/assignments/${id}`),
  create: (data) => api.post('/assignments', data),
  update: (id, data) => api.put(`/assignments/${id}`, data),
  updateStatus: (id, status) => api.patch(`/assignments/${id}/status`, { status }),
  delete: (id) => api.delete(`/assignments/${id}`),
  addNote: (id, note) => api.post(`/assignments/${id}/notes`, { note }),
  getNotes: (id) => api.get(`/assignments/${id}/notes`),
};

export default assignmentService;
