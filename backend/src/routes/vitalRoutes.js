import { Router } from 'express';
import { addVitals, getVitalsHistory } from '../controllers/vitalController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validationMiddleware.js';
import { addVitalSchema } from '../../validations/vitalValidation.js';

const router = Router();

router.use(authMiddleware);

router.post('/record', validate(addVitalSchema), addVitals);
router.get('/:patientId/history', getVitalsHistory);

export default router;
