import { Router } from 'express';
import { processVisitAudio, processVisitText, getPatientVisits, getDoctorVisits, getVisitDetail, updateVisit, deleteVisit } from '../controllers/scribeController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/roleMiddleware.js';
import { uploadAudio } from '../middlewares/uploadMiddleware.js';
import { aiLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.use(authMiddleware); // All scribe routes require authentication

router.post('/upload-audio', aiLimiter, authorize('DOCTOR'), uploadAudio, processVisitAudio);
router.post('/process-text', aiLimiter, authorize('DOCTOR'), processVisitText); // NEW: Text-only endpoint
router.get('/visits/doctor', authorize('DOCTOR'), getDoctorVisits);
router.get('/visits/:patientId', getPatientVisits);
router.get('/detail/:id', getVisitDetail);
router.put('/visits/:id', authorize('DOCTOR'), updateVisit);
router.delete('/visits/:id', authorize('DOCTOR', 'ADMIN'), deleteVisit);

export default router;
