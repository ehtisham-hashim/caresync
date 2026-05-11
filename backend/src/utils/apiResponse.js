/**
 * Standardised API response helpers.
 * All endpoints return { success, message, data?, errorCode? }.
 */

export class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }
}

export class ApiError extends Error {
  constructor(statusCode, message, errorCode = null, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errorCode = errorCode;
    this.errors = errors;
  }
}

export const sendSuccess = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (res, statusCode, message, errorCode = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errorCode,
  });
};
