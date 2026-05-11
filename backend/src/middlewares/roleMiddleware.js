import { ApiError } from '../utils/apiResponse.js';
import { ERROR_CODES } from '../../constants/errorCodes.js';

/**
 * Role-Based Access Control (RBAC) middleware.
 * Usage: authorize('DOCTOR', 'ADMIN') — only allows those roles through.
 * Must be used AFTER authMiddleware (requires req.user).
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required.', ERROR_CODES.AUTH_401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        403,
        'You do not have permission to perform this action.',
        ERROR_CODES.FORBIDDEN_403
      );
    }

    next();
  };
};

export default authorize;
