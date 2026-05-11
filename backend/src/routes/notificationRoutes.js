import { Router } from 'express';
import { getNotifications, markAsRead } from '../controllers/notificationController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);

export default router;
