import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import * as notificationService from '../services/notificationService.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const unreadOnly = req.query.unread === 'true';

  const result = await notificationService.getNotifications(req.user.id, { page, limit, unreadOnly });
  sendSuccess(res, 200, 'Notifications fetched.', result);
});

export const markAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAsRead(req.params.id, req.user.id);
  sendSuccess(res, 200, 'Notification marked as read.');
});
