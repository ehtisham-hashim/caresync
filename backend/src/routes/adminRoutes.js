import { Router } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, ApiError } from '../utils/apiResponse.js';
import { ERROR_CODES } from '../../constants/errorCodes.js';
import adminAuth from '../middlewares/adminAuth.js';
import { validateAdminCredentials } from '../controllers/adminController.js';

const router = Router();

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  validateAdminCredentials({ email, password });
  sendSuccess(res, 200, 'Admin authenticated successfully.', { email });
}));

router.use(adminAuth);

router.get('/appointments', asyncHandler(async (req, res) => {
  const appointments = await prisma.appointment.findMany({
    where: { deletedAt: null },
    orderBy: { scheduledAt: 'desc' },
    include: {
      patient: { select: { id: true, name: true, email: true } },
      doctor: { select: { id: true, name: true, email: true } },
    },
  });

  sendSuccess(res, 200, 'Appointments fetched.', appointments);
}));

router.post('/doctors', asyncHandler(async (req, res) => {
  const { email, password, name, specialization, licenseNumber } = req.body;

  if (!email || !password || !name) {
    throw new ApiError(400, 'Email, password, and name are required.', ERROR_CODES.VALIDATION_ERROR);
  }

  const existingDoctor = await prisma.user.findUnique({ where: { email } });
  if (existingDoctor) {
    throw new ApiError(409, 'A doctor with this email already exists.', ERROR_CODES.CONFLICT);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const doctor = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role: 'DOCTOR',
      doctorProfile: {
        create: {
          specialization: specialization || 'General Medicine',
          licenseNumber: licenseNumber || '',
        },
      },
    },
    include: {
      doctorProfile: true,
    },
  });

  sendSuccess(res, 201, 'Doctor created successfully.', doctor);
}));

router.patch('/doctors/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, specialization, licenseNumber, email } = req.body;

  const doctor = await prisma.user.findUnique({ where: { id } });
  if (!doctor || doctor.role !== 'DOCTOR') {
    throw new ApiError(404, 'Doctor not found.', ERROR_CODES.NOT_FOUND);
  }

  const updatedDoctor = await prisma.user.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(email && { email }),
      doctorProfile: {
        upsert: {
          create: {
            specialization: specialization || 'General Medicine',
            licenseNumber: licenseNumber || '',
          },
          update: {
            ...(specialization && { specialization }),
            ...(licenseNumber && { licenseNumber }),
          },
        },
      },
    },
    include: { doctorProfile: true },
  });

  sendSuccess(res, 200, 'Doctor updated successfully.', updatedDoctor);
}));

router.delete('/doctors/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const doctor = await prisma.user.findUnique({ where: { id } });
  if (!doctor || doctor.role !== 'DOCTOR') {
    throw new ApiError(404, 'Doctor not found.', ERROR_CODES.NOT_FOUND);
  }

  await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  sendSuccess(res, 200, 'Doctor deleted successfully.', { id });
}));

router.get('/stats', asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 6);
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const doctors = await prisma.user.findMany({
    where: { role: 'DOCTOR', deletedAt: null },
    select: { id: true, name: true },
  });

  const stats = await Promise.all(
    doctors.map(async (doctor) => {
      const [weekly, monthly] = await Promise.all([
        prisma.appointment.count({
          where: {
            doctorId: doctor.id,
            deletedAt: null,
            scheduledAt: { gte: startOfWeek },
          },
        }),
        prisma.appointment.count({
          where: {
            doctorId: doctor.id,
            deletedAt: null,
            scheduledAt: { gte: startOfMonth },
          },
        }),
      ]);

      return {
        doctorId: doctor.id,
        doctorName: doctor.name,
        weeklyAppointments: weekly,
        monthlyAppointments: monthly,
      };
    })
  );

  sendSuccess(res, 200, 'Doctor appointment stats fetched.', stats);
}));

export default router;
