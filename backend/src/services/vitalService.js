import prisma from '../config/db.js';
import { ApiError } from '../utils/apiResponse.js';
import { ERROR_CODES } from '../../constants/errorCodes.js';

/**
 * Add new vital records for a patient.
 */
export const addVitals = async (data) => {
  const vital = await prisma.vital.create({
    data: {
      patientId: data.patientId,
      heartRate: data.heartRate || null,
      bloodPressure: data.bloodPressure || null,
      weight: data.weight || null,
      temperature: data.temperature || null,
      labResults: data.labResults || null,
    },
  });

  return vital;
};

/**
 * Get vitals history for a patient (paginated, ordered by date).
 */
export const getVitalsHistory = async (patientId, { page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;

  const [vitals, total] = await Promise.all([
    prisma.vital.findMany({
      where: { patientId },
      orderBy: { recordedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.vital.count({ where: { patientId } }),
  ]);

  return { vitals, total, page, limit };
};

export default { addVitals, getVitalsHistory };
