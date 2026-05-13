import api from './api';

export const scribeService = {
  // Upload audio and get SOAP notes
  uploadAudio: async (formData) => {
    const response = await api.post('/scribe/upload-audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get doctor's visits
  getDoctorVisits: async (page = 1, limit = 20) => {
    const response = await api.get('/scribe/visits/doctor', {
      params: { page, limit }
    });
    return response.data;
  },

  // Get patient visits
  getPatientVisits: async (patientId, page = 1, limit = 20) => {
    const response = await api.get(`/scribe/visits/${patientId}`, {
      params: { page, limit }
    });
    return response.data;
  },

  // Get visit detail
  getVisitDetail: async (visitId) => {
    const response = await api.get(`/scribe/detail/${visitId}`);
    return response.data;
  },

  // Update visit
  updateVisit: async (visitId, data) => {
    const response = await api.put(`/scribe/visits/${visitId}`, data);
    return response.data;
  },

  // Delete visit
  deleteVisit: async (visitId) => {
    const response = await api.delete(`/scribe/visits/${visitId}`);
    return response.data;
  },
};
