import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import * as doctorService from '../services/doctorService.js';

/**
 * Get doctor's dashboard overview
 * Includes: upcoming appointments, pending reports, patient count
 */
export const getDoctorDashboard = asyncHandler(async (req, res) => {
  const dashboard = await doctorService.getDoctorDashboard(req.user.id);
  sendSuccess(res, 200, 'Dashboard data fetched.', dashboard);
});

/**
 * Get all patients assigned to this doctor
 */
export const getMyPatients = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const search = req.query.search || '';

  const result = await doctorService.getMyPatients(req.user.id, { page, limit, search });
  sendSuccess(res, 200, 'Patients fetched.', result);
});

/**
 * Get detailed patient profile with medical summary
 */
export const getPatientDetail = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const detail = await doctorService.getPatientDetail(patientId, req.user.id);
  sendSuccess(res, 200, 'Patient detail fetched.', detail);
});

/**
 * Get all unreviewed patient reports for this doctor
 */
export const getPendingReports = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const result = await doctorService.getPendingReports(req.user.id, { page, limit });
  sendSuccess(res, 200, 'Pending reports fetched.', result);
});

/**
 * Get doctor's statistics (total patients, visits this month, etc.)
 */
export const getDoctorStats = asyncHandler(async (req, res) => {
  const stats = await doctorService.getDoctorStats(req.user.id);
  sendSuccess(res, 200, 'Statistics fetched.', stats);
});

/**
 * Update doctor profile information
 */
export const updateDoctorProfile = asyncHandler(async (req, res) => {
  const updated = await doctorService.updateDoctorProfile(req.user.id, req.body);
  sendSuccess(res, 200, 'Profile updated successfully.', updated);
});

/**
 * Get doctor's schedule for a specific date range
 */
export const getDoctorSchedule = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const schedule = await doctorService.getDoctorSchedule(req.user.id, startDate, endDate);
  sendSuccess(res, 200, 'Schedule fetched.', schedule);
});
