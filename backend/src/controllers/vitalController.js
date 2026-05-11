import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import * as vitalService from '../services/vitalService.js';

export const addVitals = asyncHandler(async (req, res) => {
  const vital = await vitalService.addVitals(req.body);
  sendSuccess(res, 201, 'Vitals recorded.', vital);
});

export const getVitalsHistory = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const result = await vitalService.getVitalsHistory(patientId, { page, limit });
  sendSuccess(res, 200, 'Vitals history fetched.', result);
});
