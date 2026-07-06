import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, ApiError } from '../utils/apiResponse.js';
import { ERROR_CODES } from '../../constants/errorCodes.js';
import prisma from '../config/db.js';

export const validateAdminCredentials = ({ email, password }) => {
  const expectedEmail = process.env.ADMIN_EMAIL;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedEmail || !expectedPassword) {
    throw new ApiError(500, 'Admin credentials are not configured.', ERROR_CODES.INTERNAL_ERROR);
  }

  if (email !== expectedEmail || password !== expectedPassword) {
    throw new ApiError(401, 'Invalid admin credentials.', ERROR_CODES.AUTH_401);
  }
};

export const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        deletedAt: true,
      },
    }),
    prisma.user.count({ where: { deletedAt: null } }),
  ]);

  sendSuccess(res, 200, 'Users fetched.', { users, total, page, limit });
});

export const getAnalytics = asyncHandler(async (req, res) => {
  const [totalUsers, totalDoctors, totalPatients, totalVisits, totalAppointments] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { role: 'DOCTOR', deletedAt: null } }),
    prisma.user.count({ where: { role: 'PATIENT', deletedAt: null } }),
    prisma.visit.count({ where: { deletedAt: null } }),
    prisma.appointment.count({ where: { deletedAt: null } }),
  ]);

  sendSuccess(res, 200, 'Analytics fetched.', {
    totalUsers,
    totalDoctors,
    totalPatients,
    totalVisits,
    totalAppointments,
  });
});

export const getAuditLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.auditLog.count(),
  ]);

  sendSuccess(res, 200, 'Audit logs fetched.', { logs, total, page, limit });
});
