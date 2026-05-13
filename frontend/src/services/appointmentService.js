import api from './api';

export const appointmentService = {
  // Schedule appointment
  scheduleAppointment: async (data) => {
    const response = await api.post('/appointments', data);
    return response.data;
  },

  // Get appointments
  getAppointments: async (page = 1, limit = 20) => {
    const response = await api.get('/appointments', {
      params: { page, limit }
    });
    return response.data;
  },

  // Get pre-visit brief
  getPreVisitBrief: async (appointmentId, patientId) => {
    const response = await api.get(`/appointments/${appointmentId}/brief`, {
      params: { patientId }
    });
    return response.data;
  },

  // Update appointment
  updateAppointment: async (appointmentId, data) => {
    const response = await api.put(`/appointments/${appointmentId}`, data);
    return response.data;
  },
};
