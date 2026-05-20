import prisma from '../config/db.js';
import { ApiError } from '../utils/apiResponse.js';
import { ERROR_CODES } from '../../constants/errorCodes.js';
import logger from '../utils/logger.js';

/**
 * Get doctor's dashboard overview
 */
export const getDoctorDashboard = async (doctorId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [upcomingAppointments, pendingReportsCount, totalPatients, todayAppointments] = await Promise.all([
    // Next 5 upcoming appointments
    prisma.appointment.findMany({
      where: {
        doctorId,
        deletedAt: null,
        status: { in: ['PENDING', 'CONFIRMED'] },
        scheduledAt: { gte: new Date() },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 5,
      include: {
        patient: {
          select: { id: true, name: true, email: true, dateOfBirth: true },
        },
      },
    }),

    // Count of unreviewed reports
    prisma.patientReport.count({
      where: {
        doctorId,
        isReviewed: false,
        deletedAt: null,
      },
    }),

    // Total unique patients
    prisma.user.count({
      where: {
        doctors: {
          some: { id: doctorId },
        },
        role: 'PATIENT',
        deletedAt: null,
      },
    }),

    // Today's appointments
    prisma.appointment.count({
      where: {
        doctorId,
        deletedAt: null,
        scheduledAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    }),
  ]);

  return {
    upcomingAppointments,
    pendingReportsCount,
    totalPatients,
    todayAppointments,
  };
};

/**
 * Get all patients assigned to this doctor
 */
export const getMyPatients = async (doctorId, { page = 1, limit = 20, search = '' }) => {
  const skip = (page - 1) * limit;

  const where = {
    doctors: {
      some: { id: doctorId },
    },
    role: 'PATIENT',
    deletedAt: null,
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [patients, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        dateOfBirth: true,
        bloodGroup: true,
        medicalHistory: true,
        createdAt: true,
        // Get latest vital
        vitals: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
        // Get active prescriptions count
        prescriptions: {
          where: { deletedAt: null },
          select: { id: true },
        },
        // Get allergies
        allergies: {
          select: { allergen: true, severity: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { patients, total, page, limit };
};

/**
 * Get detailed patient profile with medical summary
 */
export const getPatientDetail = async (patientId, doctorId) => {
  // Verify doctor has access to this patient
  const patient = await prisma.user.findFirst({
    where: {
      id: patientId,
      role: 'PATIENT',
      deletedAt: null,
      doctors: {
        some: { id: doctorId },
      },
    },
    include: {
      vitals: {
        orderBy: { recordedAt: 'desc' },
        take: 10,
      },
      allergies: true,
      emergencyContacts: true,
      prescriptions: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          visit: {
            select: { id: true, createdAt: true },
          },
        },
      },
      patientVisits: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          createdAt: true,
          subjective: true,
          objective: true,
          assessment: true,
          plan: true,
        },
      },
      appointments: {
        where: {
          doctorId,
          deletedAt: null,
        },
        orderBy: { scheduledAt: 'desc' },
        take: 10,
      },
      patientReports: {
        where: {
          doctorId,
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!patient) {
    throw new ApiError(404, 'Patient not found or access denied.', ERROR_CODES.NOT_FOUND);
  }

  return patient;
};

/**
 * Get all unreviewed patient reports for this doctor
 */
export const getPendingReports = async (doctorId, { page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;

  const [reports, total] = await Promise.all([
    prisma.patientReport.findMany({
      where: {
        doctorId,
        isReviewed: false,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            dateOfBirth: true,
          },
        },
      },
    }),
    prisma.patientReport.count({
      where: {
        doctorId,
        isReviewed: false,
        deletedAt: null,
      },
    }),
  ]);

  return { reports, total, page, limit };
};

/**
 * Get doctor's statistics
 */
export const getDoctorStats = async (doctorId) => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalPatients,
    visitsThisMonth,
    visitsLastMonth,
    totalVisits,
    activePrescriptions,
    upcomingAppointments,
  ] = await Promise.all([
    // Total patients
    prisma.user.count({
      where: {
        doctors: { some: { id: doctorId } },
        role: 'PATIENT',
        deletedAt: null,
      },
    }),

    // Visits this month
    prisma.visit.count({
      where: {
        doctorId,
        deletedAt: null,
        createdAt: { gte: firstDayOfMonth },
      },
    }),

    // Visits last month
    prisma.visit.count({
      where: {
        doctorId,
        deletedAt: null,
        createdAt: {
          gte: firstDayOfLastMonth,
          lt: firstDayOfMonth,
        },
      },
    }),

    // Total visits all time
    prisma.visit.count({
      where: {
        doctorId,
        deletedAt: null,
      },
    }),

    // Active prescriptions
    prisma.prescription.count({
      where: {
        doctorId,
        deletedAt: null,
      },
    }),

    // Upcoming appointments
    prisma.appointment.count({
      where: {
        doctorId,
        deletedAt: null,
        status: { in: ['PENDING', 'CONFIRMED'] },
        scheduledAt: { gte: now },
      },
    }),
  ]);

  return {
    totalPatients,
    visitsThisMonth,
    visitsLastMonth,
    totalVisits,
    activePrescriptions,
    upcomingAppointments,
  };
};

/**
 * Update doctor profile information
 */
export const updateDoctorProfile = async (doctorId, data) => {
  const user = await prisma.user.findUnique({
    where: { id: doctorId },
    include: { doctorProfile: true },
  });

  if (!user || user.role !== 'DOCTOR') {
    throw new ApiError(404, 'Doctor not found.', ERROR_CODES.NOT_FOUND);
  }

  // Update user basic info
  const updateData = {};
  if (data.name) updateData.name = data.name;
  if (data.dateOfBirth) updateData.dateOfBirth = new Date(data.dateOfBirth);

  if (Object.keys(updateData).length > 0) {
    await prisma.user.update({
      where: { id: doctorId },
      data: updateData,
    });
  }

  // Update or create doctor profile
  const profileData = {};
  if (data.specialization) profileData.specialization = data.specialization;
  if (data.licenseNumber) profileData.licenseNumber = data.licenseNumber;
  if (data.clinicName !== undefined) profileData.clinicName = data.clinicName;
  if (data.consultationFee !== undefined) profileData.consultationFee = parseFloat(data.consultationFee);
  if (data.availableSlots !== undefined) profileData.availableSlots = data.availableSlots;

  let doctorProfile;
  if (user.doctorProfile) {
    doctorProfile = await prisma.doctorProfile.update({
      where: { userId: doctorId },
      data: profileData,
    });
  } else if (Object.keys(profileData).length > 0) {
    // Create profile if it doesn't exist
    doctorProfile = await prisma.doctorProfile.create({
      data: {
        userId: doctorId,
        specialization: profileData.specialization || 'General Practitioner',
        licenseNumber: profileData.licenseNumber || 'PENDING',
        ...profileData,
      },
    });
  }

  return {
    user: await prisma.user.findUnique({
      where: { id: doctorId },
      select: {
        id: true,
        name: true,
        email: true,
        dateOfBirth: true,
        doctorProfile: true,
      },
    }),
  };
};

/**
 * Get doctor's schedule for a specific date range
 */
export const getDoctorSchedule = async (doctorId, startDate, endDate) => {
  const start = startDate ? new Date(startDate) : new Date();
  const end = endDate ? new Date(endDate) : new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000); // Default 7 days

  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      deletedAt: null,
      scheduledAt: {
        gte: start,
        lte: end,
      },
    },
    orderBy: { scheduledAt: 'asc' },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          email: true,
          dateOfBirth: true,
        },
      },
    },
  });

  return { appointments, startDate: start, endDate: end };
};

export default {
  getDoctorDashboard,
  getMyPatients,
  getPatientDetail,
  getPendingReports,
  getDoctorStats,
  updateDoctorProfile,
  getDoctorSchedule,
};
