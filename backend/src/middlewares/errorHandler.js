import logger from '../utils/logger.js';
import { ApiError } from '../utils/apiResponse.js';
import { ERROR_CODES } from '../../constants/errorCodes.js';

/**
 * Global error handler middleware.
 * Catches ApiError, Prisma errors, Zod errors, JWT errors,
 * and returns a standardised JSON response.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(err.message, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  // Already a known ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode,
      errors: err.errors?.length ? err.errors : undefined,
    });
  }

  // Prisma known errors
  if (err.code && err.code.startsWith('P')) {
    let message = 'Database error.';
    let statusCode = 500;

    if (err.code === 'P2002') {
      message = `A record with this ${err.meta?.target?.join(', ') || 'field'} already exists.`;
      statusCode = 409;
    } else if (err.code === 'P2025') {
      message = 'Record not found.';
      statusCode = 404;
    }

    return res.status(statusCode).json({
      success: false,
      message,
      errorCode: ERROR_CODES.DB_ERROR,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token.',
      errorCode: ERROR_CODES.AUTH_TOKEN_INVALID,
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token has expired.',
      errorCode: ERROR_CODES.AUTH_TOKEN_EXPIRED,
    });
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File size exceeds the allowed limit.',
      errorCode: ERROR_CODES.VALIDATION_ERROR,
    });
  }

  // Fallback — unknown errors
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred.'
      : err.message,
    errorCode: ERROR_CODES.INTERNAL_ERROR,
  });
};

export default errorHandler;
