import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import * as appointmentService from '../services/appointmentService.js';
import * as aiService from '../services/aiService.js';

export const scheduleAppointment = asyncHandler(async (req, res) => {
  const data = {
    ...req.body,
    patientId: req.body.patientId || req.user.id,
  };
  const appointment = await appointmentService.scheduleAppointment(data);
  sendSuccess(res, 201, 'Appointment scheduled.', appointment);
});

export const getAppointments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const result = await appointmentService.getAppointments(req.user.id, req.user.role, { page, limit });
  sendSuccess(res, 200, 'Appointments fetched.', result);
});

export const getPreVisitBrief = asyncHandler(async (req, res) => {
  // Get the appointment to find the patient
  const appointmentId = req.params.id;
  // For now, the patientId is passed as query param or fetched from the appointment
  const { patientId } = req.query;

  const brief = await aiService.generatePreVisitBrief(patientId);
  sendSuccess(res, 200, 'Pre-visit brief generated.', { brief });
});

export const updateAppointment = asyncHandler(async (req, res) => {
  const updated = await appointmentService.updateAppointment(req.params.id, req.body, req.user.id);
  sendSuccess(res, 200, 'Appointment updated.', updated);
});
