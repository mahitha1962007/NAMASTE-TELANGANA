import api from './api';

export const reportService = {
  getSummary: () => api.get('/reports/summary'),
  getStatusCount: () => api.get('/reports/status-count'),
  getCategoryCount: () => api.get('/reports/category-count'),
  getStaffWorkload: () => api.get('/reports/staff-workload'),
  getDeadlines: () => api.get('/reports/deadlines'),
};

export default reportService;
