import { z } from 'zod';

export const submitReportSchema = z.object({
  doctorId: z.string().uuid('Invalid doctor ID.'),
  symptoms: z.string().min(1, 'Symptoms are required.'),
  severity: z.enum(['MILD', 'MODERATE', 'SEVERE'], {
    errorMap: () => ({ message: 'Severity must be MILD, MODERATE, or SEVERE.' }),
  }),
  notes: z.string().optional(),
});

export const reviewReportSchema = z.object({
  isReviewed: z.boolean(),
});
