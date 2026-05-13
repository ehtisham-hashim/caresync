import { Router } from 'express';
import { submitPatientReport, reviewPatientReport, getDoctorReports } from '../controllers/reportController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/roleMiddleware.js';
import validate from '../middlewares/validationMiddleware.js';
import { submitReportSchema } from '../../validations/reportValidation.js';

const router = Router();

router.use(authMiddleware);

router.post('/', authorize('PATIENT'), validate(submitReportSchema), submitPatientReport);
router.get('/doctor', authorize('DOCTOR'), getDoctorReports);
router.put('/:id/review', authorize('DOCTOR'), reviewPatientReport);

export default router;
