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

/**
 * Get all reports for a doctor with optional filtering
 */
export const getDoctorReports = async (doctorId, { page = 1, limit = 20, isReviewed }) => {
  const skip = (page - 1) * limit;

  const where = {
    doctorId,
    deletedAt: null,
    ...(isReviewed !== undefined && { isReviewed }),
  };

  const [reports, total] = await Promise.all([
    prisma.patientReport.findMany({
      where,
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
    prisma.patientReport.count({ where }),
  ]);

  return { reports, total, page, limit };
};

export default { submitPatientReport, reviewPatientReport, getDoctorReports };
