import { Router } from 'express';
import { registerUser, loginUser, refreshToken, logoutUser } from '../controllers/authController.js';
import validate from '../middlewares/validationMiddleware.js';
import { registerSchema, loginSchema } from '../../validations/authValidation.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), registerUser);
router.post('/login', authLimiter, validate(loginSchema), loginUser);
router.post('/refresh', refreshToken);
router.post('/logout', logoutUser);

export default router;
