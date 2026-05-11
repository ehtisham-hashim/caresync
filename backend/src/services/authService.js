import bcryptPkg from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { ApiError } from '../utils/apiResponse.js';
import { ERROR_CODES } from '../../constants/errorCodes.js';
import { logAction } from './auditService.js';

const SALT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

/**
 * Generate a short-lived access token.
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

/**
 * Generate a long-lived refresh token and persist it in the DB.
 */
const generateRefreshToken = async (userId) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  const token = jwt.sign(
    { id: userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d` }
  );

  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return token;
};

/**
 * Register a new user (PATIENT or DOCTOR).
 */
export const register = async ({ email, password, name, role, dateOfBirth, specialization, licenseNumber }) => {
  // Check if email already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists.', ERROR_CODES.AUTH_EMAIL_EXISTS);
  }

  const passwordHash = await bcryptPkg.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      // Create DoctorProfile if role is DOCTOR
      ...(role === 'DOCTOR' && specialization && licenseNumber
        ? {
            doctorProfile: {
              create: {
                specialization,
                licenseNumber,
              },
            },
          }
        : {}),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user.id);

  await logAction(user.id, 'USER_REGISTER', 'User', user.id);

  return { user, accessToken, refreshToken };
};

/**
 * Login with email and password.
 */
export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email, deletedAt: null },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      passwordHash: true,
    },
  });

  if (!user) {
    throw new ApiError(401, 'Invalid email or password.', ERROR_CODES.AUTH_INVALID_CREDENTIALS);
  }

  const isValidPassword = await bcryptPkg.compare(password, user.passwordHash);
  if (!isValidPassword) {
    throw new ApiError(401, 'Invalid email or password.', ERROR_CODES.AUTH_INVALID_CREDENTIALS);
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user.id);

  // Strip passwordHash from response
  const { passwordHash: _, ...safeUser } = user;

  return { user: safeUser, accessToken, refreshToken };
};

/**
 * Refresh access token using a valid refresh token.
 * Implements token rotation: old token is revoked, new one is issued.
 */
export const refresh = async (oldToken) => {
  if (!oldToken) {
    throw new ApiError(401, 'Refresh token is required.', ERROR_CODES.AUTH_REFRESH_INVALID);
  }

  // Verify the JWT signature
  let decoded;
  try {
    decoded = jwt.verify(oldToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token.', ERROR_CODES.AUTH_REFRESH_INVALID);
  }

  // Check the token exists and is not revoked in the DB
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: oldToken },
  });

  if (!storedToken || storedToken.revoked) {
    throw new ApiError(401, 'Refresh token has been revoked.', ERROR_CODES.AUTH_REFRESH_INVALID);
  }

  // Revoke old token (rotation)
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revoked: true },
  });

  // Fetch the user
  const user = await prisma.user.findUnique({
    where: { id: decoded.id, deletedAt: null },
    select: { id: true, email: true, role: true, name: true },
  });

  if (!user) {
    throw new ApiError(401, 'User not found.', ERROR_CODES.AUTH_401);
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user.id);

  return { accessToken, refreshToken };
};

/**
 * Logout — revokes the refresh token and clears cookie.
 */
export const logout = async (refreshTokenValue) => {
  if (refreshTokenValue) {
    await prisma.refreshToken.updateMany({
      where: { token: refreshTokenValue, revoked: false },
      data: { revoked: true },
    });
  }
};

export default { register, login, refresh, logout };
