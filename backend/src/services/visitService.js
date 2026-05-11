import prisma from '../config/db.js';
import { ApiError } from '../utils/apiResponse.js';
import { ERROR_CODES } from '../../constants/errorCodes.js';
import { logAction } from './auditService.js';

/**
 * Get all visits for a specific patient (paginated).
 */
export const getPatientVisits = async (patientId, { page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  const [visits, total] = await Promise.all([
    prisma.visit.findMany({
      where: { patientId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        audioUrl: true,
        rawTranscript: true,
        subjective: true,
        objective: true,
        assessment: true,
        plan: true,
        medicalTerms: true,
        createdAt: true,
        doctor: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.visit.count({ where: { patientId, deletedAt: null } }),
  ]);

  return { visits, total, page, limit };
};

/**
 * Get a single visit by ID.
 */
export const getVisitDetail = async (visitId) => {
  const visit = await prisma.visit.findUnique({
    where: { id: visitId, deletedAt: null },
    include: {
      patient: { select: { id: true, name: true, email: true } },
      doctor: { select: { id: true, name: true, email: true } },
      prescriptions: {
        where: { deletedAt: null },
        select: {
          id: true,
          medicineName: true,
          dosage: true,
          frequency: true,
          duration: true,
          notes: true,
          simplifiedInstructions: true,
        },
      },
    },
  });

  if (!visit) {
    throw new ApiError(404, 'Visit not found.', ERROR_CODES.NOT_FOUND);
  }

  return visit;
};

/**
 * Create a new visit record (called by scribe controller after AI processing).
 */
export const createVisit = async (data) => {
  const visit = await prisma.visit.create({
    data: {
      patientId: data.patientId,
      doctorId: data.doctorId,
      audioUrl: data.audioUrl || null,
      rawTranscript: data.rawTranscript,
      subjective: data.subjective || null,
      objective: data.objective || null,
      assessment: data.assessment || null,
      plan: data.plan || null,
      medicalTerms: data.medicalTerms || null,
    },
  });

  await logAction(data.doctorId, 'CREATE_VISIT', 'Visit', visit.id);

  return visit;
};

/**
 * Soft delete a visit.
 */
export const deleteVisit = async (visitId, userId) => {
  const visit = await prisma.visit.findUnique({ where: { id: visitId } });

  if (!visit || visit.deletedAt) {
    throw new ApiError(404, 'Visit not found.', ERROR_CODES.NOT_FOUND);
  }

  await prisma.visit.update({
    where: { id: visitId },
    data: { deletedAt: new Date() },
  });

  await logAction(userId, 'DELETE_VISIT', 'Visit', visitId);

  return { message: 'Visit archived successfully.' };
};

export default { getPatientVisits, getVisitDetail, createVisit, deleteVisit };
