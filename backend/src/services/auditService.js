import prisma from '../config/db.js';
import logger from '../utils/logger.js';

/**
 * Inserts a record into the AuditLog table.
 * Called by services whenever sensitive operations occur.
 */
export const logAction = async (userId, action, entityType, entityId, metadata = null) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        metadata,
      },
    });
  } catch (error) {
    // Audit logging should never crash the main flow
    logger.error('Failed to write audit log', { error: error.message, action, entityType, entityId });
  }
};

export default { logAction };
