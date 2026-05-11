import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import * as reportService from '../services/reportService.js';

export const submitPatientReport = asyncHandler(async (req, res) => {
  const report = await reportService.submitPatientReport(req.user.id, req.body);
  sendSuccess(res, 201, 'Report submitted.', report);
});

export const reviewPatientReport = asyncHandler(async (req, res) => {
  const report = await reportService.reviewPatientReport(req.params.id, req.user.id);
  sendSuccess(res, 200, 'Report reviewed.', report);
});
