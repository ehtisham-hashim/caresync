import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import * as prescriptionService from '../services/prescriptionService.js';

export const createPrescription = asyncHandler(async (req, res) => {
  const prescription = await prescriptionService.createPrescription(req.body, req.user.id);
  sendSuccess(res, 201, 'Prescription created.', prescription);
});

export const getPrescriptions = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const result = await prescriptionService.getPrescriptions(patientId, { page, limit });
  sendSuccess(res, 200, 'Prescriptions fetched.', result);
});

export const deletePrescription = asyncHandler(async (req, res) => {
  const result = await prescriptionService.deletePrescription(req.params.id, req.user.id);
  sendSuccess(res, 200, result.message);
});
