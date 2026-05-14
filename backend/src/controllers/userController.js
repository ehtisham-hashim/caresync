import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import * as userService from '../services/userService.js';

export const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getMe(req.user.id);
  sendSuccess(res, 200, 'Profile fetched.', user);
});

export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await userService.getUserProfile(req.params.id);
  sendSuccess(res, 200, 'User profile fetched.', user);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user.id, req.body);
  sendSuccess(res, 200, 'Profile updated.', user);
});

export const getDoctors = asyncHandler(async (req, res) => {
  const doctors = await userService.getDoctors();
  sendSuccess(res, 200, 'Doctors fetched.', doctors);
});

export const getPatients = asyncHandler(async (req, res) => {
  const patients = await userService.getPatients();
  sendSuccess(res, 200, 'Patients fetched.', patients);
});
