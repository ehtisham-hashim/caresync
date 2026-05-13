import { z } from 'zod';

export const updateDoctorProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    dateOfBirth: z.string().datetime().optional(),
    specialization: z.string().min(2).max(100).optional(),
    licenseNumber: z.string().min(3).max(50).optional(),
    clinicName: z.string().min(2).max(200).optional().nullable(),
    consultationFee: z.number().positive().optional().nullable(),
    availableSlots: z.any().optional().nullable(), // JSON field
  }),
});

export const getScheduleSchema = z.object({
  query: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});
