import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, ApiError } from '../utils/apiResponse.js';
import { ERROR_CODES } from '../../constants/errorCodes.js';
import prisma from '../config/db.js';
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
  const appointmentId = req.params.id;

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId, deletedAt: null },
  });

  if (!appointment) {
    throw new ApiError(404, 'Appointment not found.', ERROR_CODES.NOT_FOUND);
  }

  if (appointment.doctorId !== req.user.id) {
    throw new ApiError(403, 'You do not have permission to view this patient\'s data.', ERROR_CODES.FORBIDDEN_403);
  }

  const brief = await aiService.generatePreVisitBrief(appointment.patientId);
  sendSuccess(res, 200, 'Pre-visit brief generated.', { brief });
});

export const updateAppointment = asyncHandler(async (req, res) => {
  const updated = await appointmentService.updateAppointment(req.params.id, req.body, req.user.id);
  sendSuccess(res, 200, 'Appointment updated.', updated);
});

export const confirmAppointment = asyncHandler(async (req, res) => {
  const confirmed = await appointmentService.confirmAppointment(req.params.id, req.user.id);
  sendSuccess(res, 200, 'Appointment confirmed.', confirmed);
});

export const cancelAppointment = asyncHandler(async (req, res) => {
  const cancelled = await appointmentService.cancelAppointment(req.params.id, req.user.id);
  sendSuccess(res, 200, 'Appointment cancelled.', cancelled);
});
