import prisma from '../config/db.js';

/**
 * Create an in-app notification.
 */
export const createNotification = async (userId, type, title, message) => {
  return prisma.notification.create({
    data: { userId, type, title, message },
  });
};

/**
 * Get all notifications for a user (paginated).
 */
export const getNotifications = async (userId, { page = 1, limit = 20, unreadOnly = false }) => {
  const skip = (page - 1) * limit;

  const where = {
    userId,
    deletedAt: null,
    ...(unreadOnly ? { isRead: false } : {}),
  };

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return { notifications, total, page, limit };
};

/**
 * Mark a notification as read.
 */
export const markAsRead = async (notificationId, userId) => {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
};

export default { createNotification, getNotifications, markAsRead };
