import { Router } from 'express';
import {
  getDoctorDashboard,
  getMyPatients,
  getPatientDetail,
  getPendingReports,
  getDoctorStats,
  updateDoctorProfile,
  getDoctorSchedule,
} from '../controllers/doctorController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/roleMiddleware.js';

const router = Router();

// All routes require authentication and DOCTOR role
router.use(authMiddleware);
router.use(authorize('DOCTOR'));

// Dashboard & Statistics
router.get('/dashboard', getDoctorDashboard);
router.get('/stats', getDoctorStats);
router.get('/schedule', getDoctorSchedule);

// Patient Management
router.get('/patients', getMyPatients);
router.get('/patients/:patientId', getPatientDetail);

// Reports Management
router.get('/reports/pending', getPendingReports);

// Profile Management
router.put('/profile', updateDoctorProfile);

export default router;
