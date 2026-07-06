import { Router } from 'express';
import { getAllUsers, getAnalytics, getAuditLogs, getDoctorsWithPatients } from '../controllers/adminController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/roleMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.use(authorize('ADMIN')); // All admin routes require ADMIN role

router.get('/users', getAllUsers);
router.get('/analytics', getAnalytics);
router.get('/audit-logs', getAuditLogs);
router.get('/doctors-patients', getDoctorsWithPatients);

export default router;
