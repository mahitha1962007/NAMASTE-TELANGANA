import api from './api';

export const staffService = {
  getAll: (role) => api.get('/staff', { params: role ? { role } : {} }),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.put(`/staff/${id}`, data),
  deactivate: (id) => api.patch(`/staff/${id}/deactivate`),
  suggest: () => api.get('/staff/suggest'),
};

export default staffService;
