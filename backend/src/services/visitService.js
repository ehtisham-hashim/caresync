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
 * Get all visits conducted by a specific doctor (paginated).
 */
export const getDoctorVisits = async (doctorId, { page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;

  const [visits, total] = await Promise.all([
    prisma.visit.findMany({
      where: { doctorId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        subjective: true,
        assessment: true,
        createdAt: true,
        patient: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
    prisma.visit.count({ where: { doctorId, deletedAt: null } }),
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
 * Update an existing visit (for editing SOAP notes).
 */
export const updateVisit = async (visitId, data, userId) => {
  const visit = await prisma.visit.findUnique({ where: { id: visitId } });

  if (!visit || visit.deletedAt) {
    throw new ApiError(404, 'Visit not found.', ERROR_CODES.NOT_FOUND);
  }

  const updateData = {};
  if (data.subjective !== undefined) updateData.subjective = data.subjective;
  if (data.objective !== undefined) updateData.objective = data.objective;
  if (data.assessment !== undefined) updateData.assessment = data.assessment;
  if (data.plan !== undefined) updateData.plan = data.plan;
  if (data.medicalTerms !== undefined) updateData.medicalTerms = data.medicalTerms;

  const updated = await prisma.visit.update({
    where: { id: visitId },
    data: updateData,
  });

  await logAction(userId, 'UPDATE_VISIT', 'Visit', visitId, { changes: updateData });

  return updated;
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

export default { getPatientVisits, getDoctorVisits, getVisitDetail, createVisit, updateVisit, deleteVisit };

/**
 * Process text transcript directly (without audio file) - for testing
 */
export const processVisitText = async (transcript, patientId, doctorId) => {
  // Import AI service
  const aiService = await import('./aiService.js');
  
  // Verify patient exists
  const patient = await prisma.user.findUnique({
    where: { id: patientId, role: 'PATIENT', deletedAt: null },
  });

  if (!patient) {
    throw new ApiError(404, 'Patient not found.', ERROR_CODES.NOT_FOUND);
  }

  // Generate SOAP notes from transcript using AI
  const soapNote = await aiService.generateSOAP(transcript);

  // Ensure medicalTerms is always an array
  const medicalTerms = Array.isArray(soapNote.medicalTerms) ? soapNote.medicalTerms : [];

  // Create visit record
  const visit = await createVisit({
    patientId,
    doctorId,
    audioUrl: null, // No audio file for text-only
    rawTranscript: transcript,
    subjective: soapNote.subjective || 'Not discussed in this visit.',
    objective: soapNote.objective || 'Not discussed in this visit.',
    assessment: soapNote.assessment || 'Not discussed in this visit.',
    plan: soapNote.plan || 'Not discussed in this visit.',
    medicalTerms: medicalTerms,
  });

  return {
    visit,
    soapNote: {
      ...soapNote,
      medicalTerms,
    },
  };
};

/**
 * Process audio file and generate SOAP notes
 */
export const processVisitAudio = async (audioFile, patientId, doctorId) => {
  // Import services
  const audioService = await import('./audioService.js');
  const aiService = await import('./aiService.js');
  const storageService = await import('./storageService.js');

  // Verify patient exists
  const patient = await prisma.user.findUnique({
    where: { id: patientId, role: 'PATIENT', deletedAt: null },
  });

  if (!patient) {
    throw new ApiError(404, 'Patient not found.', ERROR_CODES.NOT_FOUND);
  }

  // Transcribe audio
  const transcript = await audioService.transcribeAudio(audioFile.path);

  // Upload audio to storage
  const audioUrl = await storageService.uploadFile(audioFile.path, 'audio');

  // Generate SOAP notes
  const soapNote = await aiService.generateSOAP(transcript);

  // Create visit record
  const visit = await createVisit({
    patientId,
    doctorId,
    audioUrl,
    rawTranscript: transcript,
    subjective: soapNote.subjective,
    objective: soapNote.objective,
    assessment: soapNote.assessment,
    plan: soapNote.plan,
    medicalTerms: soapNote.medicalTerms || [],
  });

  return {
    visit,
    soapNote,
  };
};
