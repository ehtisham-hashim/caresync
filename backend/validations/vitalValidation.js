import { z } from 'zod';

export const addVitalSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID.'),
  heartRate: z.number().int().positive().optional(),
  bloodPressure: z.string().optional(),
  weight: z.number().positive().optional(),
  temperature: z.number().positive().optional(),
  labResults: z.array(z.object({
    test: z.string(),
    value: z.string(),
    unit: z.string().optional(),
  })).optional(),
});
