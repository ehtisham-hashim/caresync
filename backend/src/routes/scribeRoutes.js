import { Router } from 'express';
import { processVisitAudio, getPatientVisits, getVisitDetail, deleteVisit } from '../controllers/scribeController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/roleMiddleware.js';
import { uploadAudio } from '../middlewares/uploadMiddleware.js';
import { aiLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.use(authMiddleware); // All scribe routes require authentication

router.post('/upload-audio', aiLimiter, authorize('DOCTOR'), uploadAudio, processVisitAudio);
router.get('/visits/:patientId', getPatientVisits);
router.get('/detail/:id', getVisitDetail);
router.delete('/visits/:id', authorize('DOCTOR', 'ADMIN'), deleteVisit);

export default router;
