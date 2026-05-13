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

export const getDoctorReports = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const isReviewed = req.query.isReviewed === 'true' ? true : req.query.isReviewed === 'false' ? false : undefined;

  const result = await reportService.getDoctorReports(req.user.id, { page, limit, isReviewed });
  sendSuccess(res, 200, 'Reports fetched.', result);
});
