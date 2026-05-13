import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import * as visitService from '../services/visitService.js';

/**
 * Process audio and generate SOAP notes
 */
export const processVisitAudio = asyncHandler(async (req, res) => {
  const { patientId } = req.body;
  const audioFile = req.file;

  const result = await visitService.processVisitAudio(
    audioFile,
    patientId,
    req.user.id
  );

  sendSuccess(res, 201, 'Visit processed successfully.', result);
});

/**
 * Process text transcript directly (for testing without audio)
 */
export const processVisitText = asyncHandler(async (req, res) => {
  const { patientId, transcript } = req.body;

  const result = await visitService.processVisitText(
    transcript,
    patientId,
    req.user.id
  );

  sendSuccess(res, 201, 'Visit processed successfully.', result);
});

/**
 * Get all visits for a specific patient
 */
export const getPatientVisits = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const result = await visitService.getPatientVisits(patientId, { page, limit });
  sendSuccess(res, 200, 'Patient visits fetched.', result);
});

/**
 * Get all visits conducted by the logged-in doctor
 */
export const getDoctorVisits = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const result = await visitService.getDoctorVisits(req.user.id, { page, limit });
  sendSuccess(res, 200, 'Doctor visits fetched.', result);
});

/**
 * Get detailed view of a single visit
 */
export const getVisitDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const visit = await visitService.getVisitDetail(id);
  sendSuccess(res, 200, 'Visit detail fetched.', visit);
});

/**
 * Update SOAP notes for an existing visit
 */
export const updateVisit = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await visitService.updateVisit(id, req.body, req.user.id);
  sendSuccess(res, 200, 'Visit updated successfully.', updated);
});

/**
 * Soft delete (archive) a visit
 */
export const deleteVisit = asyncHandler(async (req, res) => {
  await visitService.deleteVisit(req.params.id, req.user.id);
  sendSuccess(res, 200, 'Visit deleted successfully.');
});
