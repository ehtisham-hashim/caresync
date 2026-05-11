import { z } from 'zod';

export const scheduleAppointmentSchema = z.object({
  doctorId: z.string().uuid('Invalid doctor ID.'),
  patientId: z.string().uuid('Invalid patient ID.').optional(), // Optional: defaults to req.user.id for patients
  scheduledAt: z.string().datetime('Invalid date format.'),
  reason: z.string().optional(),
});

export const updateAppointmentSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).optional(),
  scheduledAt: z.string().datetime('Invalid date format.').optional(),
  reason: z.string().optional(),
});
