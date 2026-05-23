import prisma from '../config/db.js';
import { ApiError } from '../utils/apiResponse.js';
import { ERROR_CODES } from '../../constants/errorCodes.js';

let clients = [];

export const addClient = (res) => {
  const clientId = Date.now();
  const newClient = { id: clientId, res };
  clients.push(newClient);
  return clientId;
};

export const removeClient = (clientId) => {
  clients = clients.filter(c => c.id !== clientId);
};

export const broadcastUpdate = () => {
  clients.forEach(client => {
    try {
      client.res.write('data: {"type": "appointments-updated"}\n\n');
    } catch (e) {
      // client connection might be broken
    }
  });
};

/**
 * Schedule a new appointment. Prevents double-booking for doctors.
 * Also links patient to doctor if not already linked.
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

  // Create appointment
  const appointment = await prisma.appointment.create({
    data: {
      patientId: data.patientId,
      doctorId: data.doctorId,
      scheduledAt: new Date(data.scheduledAt),
      status: 'PENDING',
      reason: data.reason || null,
    },
  });

  // Link patient to doctor if not already linked
  const patient = await prisma.user.findUnique({
    where: { id: data.patientId },
    include: {
      doctors: {
        where: { id: data.doctorId },
      },
    },
  });

  if (patient && patient.doctors.length === 0) {
    // Patient is not linked to this doctor, so link them
    await prisma.user.update({
      where: { id: data.patientId },
      data: {
        doctors: {
          connect: { id: data.doctorId },
        },
      },
    });
  }

  broadcastUpdate();
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

  broadcastUpdate();
  return updated;
};

/**
 * Confirm appointment (doctor only)
 */
export const confirmAppointment = async (appointmentId, doctorId) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId, deletedAt: null },
  });

  if (!appointment) {
    throw new ApiError(404, 'Appointment not found.', ERROR_CODES.NOT_FOUND);
  }

  if (appointment.doctorId !== doctorId) {
    throw new ApiError(403, 'You can only confirm your own appointments.', ERROR_CODES.FORBIDDEN);
  }

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: 'CONFIRMED' },
    include: {
      patient: { select: { id: true, name: true, email: true } },
      doctor: { select: { id: true, name: true, email: true } },
    },
  });

  broadcastUpdate();
  return updated;
};

/**
 * Cancel appointment (patient or doctor)
 */
export const cancelAppointment = async (appointmentId, userId) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId, deletedAt: null },
  });

  if (!appointment) {
    throw new ApiError(404, 'Appointment not found.', ERROR_CODES.NOT_FOUND);
  }

  // Check if user is patient or doctor of this appointment
  if (appointment.patientId !== userId && appointment.doctorId !== userId) {
    throw new ApiError(403, 'You can only cancel your own appointments.', ERROR_CODES.FORBIDDEN);
  }

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: 'CANCELLED' },
    include: {
      patient: { select: { id: true, name: true, email: true } },
      doctor: { select: { id: true, name: true, email: true } },
    },
  });

  broadcastUpdate();
  return updated;
};

export default { scheduleAppointment, getAppointments, updateAppointment, confirmAppointment, cancelAppointment };
