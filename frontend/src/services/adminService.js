import api from './api';

export const getAdminAnalytics = async () => {
  const response = await api.get('/admin/analytics');
  return response.data;
};

export const getAllUsers = async (page = 1, limit = 20) => {
  const response = await api.get(`/admin/users?page=${page}&limit=${limit}`);
  return response.data;
};

export const getDoctorsWithPatients = async () => {
  const response = await api.get('/admin/doctors-patients');
  return response.data;
};

export const getAuditLogs = async (page = 1, limit = 50) => {
  const response = await api.get(`/admin/audit-logs?page=${page}&limit=${limit}`);
  return response.data;
};
