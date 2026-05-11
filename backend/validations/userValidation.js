import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  dateOfBirth: z.string().datetime().optional(),
  bloodGroup: z.string().optional(),
  medicalHistory: z.array(z.string()).optional(),
  insuranceInfo: z.record(z.any()).optional(),
  familyHistory: z.record(z.any()).optional(),
});
