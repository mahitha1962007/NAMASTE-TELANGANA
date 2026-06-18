import api from './api';

export const eventService = {
  getAll: () => api.get('/events'),
  getMy: () => api.get('/events/my'),
  create: (data) => api.post('/events', data),
  updateStatus: (id, status) => api.patch(`/events/${id}/status`, { status }),
};

export default eventService;
