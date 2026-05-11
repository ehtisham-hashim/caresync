import prisma from '../config/db.js';
import { ApiError } from '../utils/apiResponse.js';
import { ERROR_CODES } from '../../constants/errorCodes.js';

/**
 * Patient submits a symptom/progress report to their doctor.
 */
export const submitPatientReport = async (patientId, data) => {
  const report = await prisma.patientReport.create({
    data: {
      patientId,
      doctorId: data.doctorId,
      symptoms: data.symptoms,
      severity: data.severity,
      notes: data.notes || null,
    },
  });

  return report;
};

/**
 * Doctor marks a patient report as reviewed.
 */
export const reviewPatientReport = async (reportId, doctorId) => {
  const report = await prisma.patientReport.findUnique({
    where: { id: reportId, deletedAt: null },
  });

  if (!report) {
    throw new ApiError(404, 'Report not found.', ERROR_CODES.NOT_FOUND);
  }

  if (report.doctorId !== doctorId) {
    throw new ApiError(403, 'You can only review reports assigned to you.', ERROR_CODES.FORBIDDEN_403);
  }

  const updated = await prisma.patientReport.update({
    where: { id: reportId },
    data: { isReviewed: true },
  });

  return updated;
};

export default { submitPatientReport, reviewPatientReport };
