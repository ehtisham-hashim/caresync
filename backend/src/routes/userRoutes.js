import { Router } from 'express';
import { getMe, getUserProfile, updateProfile, getDoctors } from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validationMiddleware.js';
import { updateProfileSchema } from '../../validations/userValidation.js';

const router = Router();

router.use(authMiddleware); // All user routes require authentication

router.get('/me', getMe);
router.get('/doctors', getDoctors);
router.get('/:id', getUserProfile);
router.put('/profile', validate(updateProfileSchema), updateProfile);

export default router;
