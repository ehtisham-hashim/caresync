import { Router } from 'express';
import { createPrescription, getPrescriptions, deletePrescription } from '../controllers/prescriptionController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/roleMiddleware.js';
import validate from '../middlewares/validationMiddleware.js';
import { createPrescriptionSchema } from '../../validations/prescriptionValidation.js';

const router = Router();

router.use(authMiddleware);

router.post('/', authorize('DOCTOR'), validate(createPrescriptionSchema), createPrescription);
router.get('/:patientId', getPrescriptions);
router.delete('/:id', authorize('DOCTOR', 'ADMIN'), deletePrescription);

export default router;
