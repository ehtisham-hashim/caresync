import api from './api';

export const prescriptionService = {
  // Create prescription
  createPrescription: async (data) => {
    const response = await api.post('/prescriptions', data);
    return response.data;
  },

  // Get patient prescriptions
  getPrescriptions: async (patientId, page = 1, limit = 20) => {
    const response = await api.get(`/prescriptions/${patientId}`, {
      params: { page, limit }
    });
    return response.data;
  },

  // Delete prescription
  deletePrescription: async (prescriptionId) => {
    const response = await api.delete(`/prescriptions/${prescriptionId}`);
    return response.data;
  },
};
