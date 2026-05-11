import prisma from '../config/db.js';
import { ApiError } from '../utils/apiResponse.js';
import { ERROR_CODES } from '../../constants/errorCodes.js';

/**
 * Schedule a new appointment. Prevents double-booking for doctors.
 */
export const scheduleAppointment = async (data) => {
  // Check for double-booking: same doctor within 30-minute window
  const windowStart = new Date(data.scheduledAt);
  windowStart.setMinutes(windowStart.getMinutes() - 30);
  const windowEnd = new Date(data.scheduledAt);
  windowEnd.setMinutes(windowEnd.getMinutes() + 30);

  const conflicting = await prisma.appointment.findFirst({
    where: {
      doctorId: data.doctorId,
      deletedAt: null,
      status: { in: ['PENDING', 'CONFIRMED'] },
      scheduledAt: {
        gte: windowStart,
        lte: windowEnd,
      },
    },
  });

  if (conflicting) {
    throw new ApiError(
      409,
      'This doctor already has an appointment scheduled within this time window.',
      ERROR_CODES.CONFLICT
    );
  }

  const appointment = await prisma.appointment.create({
    data: {
      patientId: data.patientId,
      doctorId: data.doctorId,
      scheduledAt: new Date(data.scheduledAt),
      status: 'PENDING',
      reason: data.reason || null,
    },
  });

  return appointment;
};

/**
 * Get appointments for a user (filtered by role).
 */
export const getAppointments = async (userId, role, { page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
    ...(role === 'PATIENT' ? { patientId: userId } : {}),
    ...(role === 'DOCTOR' ? { doctorId: userId } : {}),
    // ADMIN sees all
  };

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      orderBy: { scheduledAt: 'asc' },
      skip,
      take: limit,
      include: {
        patient: { select: { id: true, name: true, email: true } },
        doctor: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.appointment.count({ where }),
  ]);

  return { appointments, total, page, limit };
};

/**
 * Update appointment status or reschedule.
 */
export const updateAppointment = async (appointmentId, data, userId) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId, deletedAt: null },
  });

  if (!appointment) {
    throw new ApiError(404, 'Appointment not found.', ERROR_CODES.NOT_FOUND);
  }

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      ...(data.status && { status: data.status }),
      ...(data.scheduledAt && { scheduledAt: new Date(data.scheduledAt) }),
      ...(data.reason !== undefined && { reason: data.reason }),
    },
  });

  return updated;
};

export default { scheduleAppointment, getAppointments, updateAppointment };
