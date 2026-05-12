import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  name: z.string().min(1, 'Name is required.'),
  role: z.enum(['PATIENT', 'DOCTOR'], {
    errorMap: () => ({ message: 'Role must be PATIENT or DOCTOR.' }),
  }),
  dateOfBirth: z.string().optional(),
  // Doctor-specific fields (optional, only for DOCTOR role)
  specialization: z.string().optional(),
  licenseNumber: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(1, 'Password is required.'),
});
