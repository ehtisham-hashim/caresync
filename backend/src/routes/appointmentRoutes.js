import { Router } from 'express';
import { scheduleAppointment, getAppointments, getPreVisitBrief, updateAppointment, confirmAppointment, cancelAppointment } from '../controllers/appointmentController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/roleMiddleware.js';
import validate from '../middlewares/validationMiddleware.js';
import { scheduleAppointmentSchema, updateAppointmentSchema } from '../../validations/appointmentValidation.js';

import jwt from 'jsonwebtoken';
import * as appointmentService from '../services/appointmentService.js';

const router = Router();

router.get('/updates', (req, res) => {
  const token = req.query.token;
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const clientId = appointmentService.addClient(res);

  // Send initial connection message
  res.write('data: {"type": "connected"}\n\n');

  // Keep connection alive with 15s heartbeats
  const heartbeat = setInterval(() => {
    res.write(':\n\n');
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    appointmentService.removeClient(clientId);
  });
});

router.use(authMiddleware);

router.post('/', validate(scheduleAppointmentSchema), scheduleAppointment);
router.get('/', getAppointments);
router.get('/:id/brief', authorize('DOCTOR'), getPreVisitBrief);
router.put('/:id', validate(updateAppointmentSchema), updateAppointment);
router.patch('/:id/confirm', authorize('DOCTOR'), confirmAppointment);
router.patch('/:id/cancel', cancelAppointment);

export default router;
