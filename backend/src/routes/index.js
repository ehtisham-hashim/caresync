import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import scribeRoutes from './scribeRoutes.js';
import vitalRoutes from './vitalRoutes.js';
import chatRoutes from './chatRoutes.js';
import reportRoutes from './reportRoutes.js';
import appointmentRoutes from './appointmentRoutes.js';
import prescriptionRoutes from './prescriptionRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import doctorRoutes from './doctorRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/doctor', doctorRoutes);
router.use('/scribe', scribeRoutes);
router.use('/vitals', vitalRoutes);
router.use('/chat', chatRoutes);
router.use('/reports', reportRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/notifications', notificationRoutes);

export default router;
