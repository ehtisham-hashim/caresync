import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import * as authService from '../services/authService.js';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

export const registerUser = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
  sendSuccess(res, 201, 'User registered successfully.', { user, accessToken });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
  sendSuccess(res, 200, 'Login successful.', { user, accessToken });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const oldToken = req.cookies?.refreshToken;
  const { accessToken, refreshToken: newRefreshToken } = await authService.refresh(oldToken);

  res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);
  sendSuccess(res, 200, 'Token refreshed.', { accessToken });
});

export const logoutUser = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  await authService.logout(token);

  res.clearCookie('refreshToken', { path: '/' });
  sendSuccess(res, 200, 'Logged out successfully.');
});
