import prisma from '../config/db.js';
import { ApiError } from '../utils/apiResponse.js';
import { ERROR_CODES } from '../../constants/errorCodes.js';

/**
 * Get the current logged-in user profile (from JWT payload).
 */
export const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId, deletedAt: null },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      dateOfBirth: true,
      bloodGroup: true,
      medicalHistory: true,
      insuranceInfo: true,
      familyHistory: true,
      createdAt: true,
      doctorProfile: true,
    },
  });

  if (!user) {
    throw new ApiError(404, 'User not found.', ERROR_CODES.NOT_FOUND);
  }

  return user;
};

/**
 * Get a specific user's profile by ID.
 */
export const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId, deletedAt: null },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      dateOfBirth: true,
      bloodGroup: true,
      medicalHistory: true,
      createdAt: true,
      doctorProfile: {
        select: {
          specialization: true,
          clinicName: true,
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(404, 'User not found.', ERROR_CODES.NOT_FOUND);
  }

  return user;
};

/**
 * Update user profile details and health info.
 */
export const updateProfile = async (userId, data) => {
  const user = await prisma.user.update({
    where: { id: userId, deletedAt: null },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.dateOfBirth && { dateOfBirth: new Date(data.dateOfBirth) }),
      ...(data.bloodGroup !== undefined && { bloodGroup: data.bloodGroup }),
      ...(data.medicalHistory && { medicalHistory: data.medicalHistory }),
      ...(data.insuranceInfo !== undefined && { insuranceInfo: data.insuranceInfo }),
      ...(data.familyHistory !== undefined && { familyHistory: data.familyHistory }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      dateOfBirth: true,
      bloodGroup: true,
      medicalHistory: true,
      insuranceInfo: true,
      familyHistory: true,
      updatedAt: true,
    },
  });

  return user;
};

/**
 * Get all doctors.
 */
export const getDoctors = async () => {
  const doctors = await prisma.user.findMany({
    where: { role: 'DOCTOR', deletedAt: null },
    select: {
      id: true,
      name: true,
      doctorProfile: {
        select: {
          specialization: true,
        },
      },
    },
  });
  return doctors;
};

export default { getMe, getUserProfile, updateProfile, getDoctors };
