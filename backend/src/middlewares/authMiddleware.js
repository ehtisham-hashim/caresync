import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/apiResponse.js';
import { ERROR_CODES } from '../../constants/errorCodes.js';

/**
 * Verifies JWT from Authorization header.
 * Attaches decoded user payload to req.user = { id, role, email }.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Access denied. No token provided.', ERROR_CODES.AUTH_401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, email }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token has expired.', ERROR_CODES.AUTH_TOKEN_EXPIRED);
    }
    throw new ApiError(401, 'Invalid token.', ERROR_CODES.AUTH_TOKEN_INVALID);
  }
};

export default authMiddleware;
