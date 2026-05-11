import { Router } from 'express';
import { scheduleAppointment, getAppointments, getPreVisitBrief, updateAppointment } from '../controllers/appointmentController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/roleMiddleware.js';
import validate from '../middlewares/validationMiddleware.js';
import { scheduleAppointmentSchema, updateAppointmentSchema } from '../../validations/appointmentValidation.js';

const router = Router();

router.use(authMiddleware);

router.post('/', validate(scheduleAppointmentSchema), scheduleAppointment);
router.get('/', getAppointments);
router.get('/:id/brief', authorize('DOCTOR'), getPreVisitBrief);
router.put('/:id', validate(updateAppointmentSchema), updateAppointment);

export default router;
