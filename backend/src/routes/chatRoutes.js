import { Router } from 'express';
import { askHealthCompanion, explainMedicalTerm } from '../controllers/chatController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validationMiddleware.js';
import { askCompanionSchema, explainTermSchema } from '../../validations/chatValidation.js';
import { aiLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.use(authMiddleware);

router.post('/ask', aiLimiter, validate(askCompanionSchema), askHealthCompanion);
router.post('/explain-term', aiLimiter, validate(explainTermSchema), explainMedicalTerm);

export default router;
