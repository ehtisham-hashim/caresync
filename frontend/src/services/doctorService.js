import api from './api';

export const doctorService = {
  // Dashboard & Stats
  getDashboard: async () => {
    const response = await api.get('/doctor/dashboard');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/doctor/stats');
    return response.data;
  },

  getSchedule: async (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get('/doctor/schedule', { params });
    return response.data;
  },

  // Patient Management
  getMyPatients: async (page = 1, limit = 20, search = '') => {
    const response = await api.get('/doctor/patients', {
      params: { page, limit, search }
    });
    return response.data;
  },

  getPatientDetail: async (patientId) => {
    const response = await api.get(`/doctor/patients/${patientId}`);
    return response.data;
  },

  // Reports
  getPendingReports: async (page = 1, limit = 20) => {
    const response = await api.get('/doctor/reports/pending', {
      params: { page, limit }
    });
    return response.data;
  },

  getAllReports: async (page = 1, limit = 20, isReviewed) => {
    const params = { page, limit };
    if (isReviewed !== undefined) params.isReviewed = isReviewed;
    const response = await api.get('/reports/doctor', { params });
    return response.data;
  },

  reviewReport: async (reportId) => {
    const response = await api.put(`/reports/${reportId}/review`);
    return response.data;
  },

  // Profile
  updateProfile: async (data) => {
    const response = await api.put('/doctor/profile', data);
    return response.data;
  },
};
