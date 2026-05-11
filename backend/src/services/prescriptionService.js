import prisma from '../config/db.js';
import { ApiError } from '../utils/apiResponse.js';
import { ERROR_CODES } from '../../constants/errorCodes.js';
import { logAction } from './auditService.js';

/**
 * Create a new prescription and auto-generate MedicationSchedule entries.
 */
export const createPrescription = async (data, doctorId) => {
  const prescription = await prisma.prescription.create({
    data: {
      patientId: data.patientId,
      doctorId,
      visitId: data.visitId,
      medicineName: data.medicineName,
      dosage: data.dosage,
      frequency: data.frequency,
      duration: data.duration,
      notes: data.notes || null,
    },
  });

  // Auto-generate MedicationSchedule entries based on frequency
  const schedules = generateSchedules(prescription.id, data.frequency, data.duration);
  if (schedules.length > 0) {
    await prisma.medicationSchedule.createMany({ data: schedules });
  }

  await logAction(doctorId, 'CREATE_PRESCRIPTION', 'Prescription', prescription.id);

  return prescription;
};

/**
 * Generate medication schedule entries based on frequency and duration.
 * E.g., "3 times daily" for "7 days" = 21 schedule entries.
 */
const generateSchedules = (prescriptionId, frequency, duration) => {
  const schedules = [];

  // Parse frequency (e.g., "3 times daily", "twice daily", "once daily")
  let timesPerDay = 1;
  const freqLower = frequency.toLowerCase();
  if (freqLower.includes('twice') || freqLower.includes('2')) timesPerDay = 2;
  else if (freqLower.includes('three') || freqLower.includes('3')) timesPerDay = 3;
  else if (freqLower.includes('four') || freqLower.includes('4')) timesPerDay = 4;

  // Parse duration (e.g., "7 days", "2 weeks", "1 month")
  let totalDays = 7; // Default
  const durationMatch = duration.match(/(\d+)/);
  if (durationMatch) {
    totalDays = parseInt(durationMatch[1], 10);
    if (duration.toLowerCase().includes('week')) totalDays *= 7;
    else if (duration.toLowerCase().includes('month')) totalDays *= 30;
  }

  // Generate schedule entries
  const baseHours = [8, 14, 20, 23]; // Morning, Afternoon, Evening, Night
  const now = new Date();

  for (let day = 0; day < totalDays; day++) {
    for (let dose = 0; dose < timesPerDay; dose++) {
      const reminderTime = new Date(now);
      reminderTime.setDate(reminderTime.getDate() + day);
      reminderTime.setHours(baseHours[dose] || 8 + dose * 6, 0, 0, 0);

      schedules.push({
        prescriptionId,
        reminderTime,
        isTaken: false,
        notificationSent: false,
      });
    }
  }

  return schedules;
};

/**
 * Get all prescriptions for a patient.
 */
export const getPrescriptions = async (patientId, { page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;

  const [prescriptions, total] = await Promise.all([
    prisma.prescription.findMany({
      where: { patientId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        doctor: { select: { id: true, name: true } },
        visit: { select: { id: true, createdAt: true } },
        medSchedules: {
          orderBy: { reminderTime: 'asc' },
          take: 10,
        },
      },
    }),
    prisma.prescription.count({ where: { patientId, deletedAt: null } }),
  ]);

  return { prescriptions, total, page, limit };
};

/**
 * Soft delete a prescription.
 */
export const deletePrescription = async (prescriptionId, userId) => {
  const prescription = await prisma.prescription.findUnique({ where: { id: prescriptionId } });

  if (!prescription || prescription.deletedAt) {
    throw new ApiError(404, 'Prescription not found.', ERROR_CODES.NOT_FOUND);
  }

  await prisma.prescription.update({
    where: { id: prescriptionId },
    data: { deletedAt: new Date() },
  });

  await logAction(userId, 'DELETE_PRESCRIPTION', 'Prescription', prescriptionId);

  return { message: 'Prescription deleted successfully.' };
};

export default { createPrescription, getPrescriptions, deletePrescription };
