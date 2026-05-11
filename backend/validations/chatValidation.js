import { z } from 'zod';

export const askCompanionSchema = z.object({
  query: z.string().min(1, 'Query is required.'),
  patientId: z.string().uuid('Invalid patient ID.').optional(), // Defaults to req.user.id for patients
});

export const explainTermSchema = z.object({
  term: z.string().min(1, 'Medical term is required.'),
});
