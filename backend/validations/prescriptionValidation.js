import { z } from 'zod';

export const createPrescriptionSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID.'),
  visitId: z.string().uuid('Invalid visit ID.'),
  medicineName: z.string().min(1, 'Medicine name is required.'),
  dosage: z.string().min(1, 'Dosage is required.'),
  frequency: z.string().min(1, 'Frequency is required.'),
  duration: z.string().min(1, 'Duration is required.'),
  notes: z.string().optional(),
});
