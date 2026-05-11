import { ApiError } from '../utils/apiResponse.js';
import { ERROR_CODES } from '../../constants/errorCodes.js';

/**
 * Zod validation middleware factory.
 * Usage: validate(zodSchema) — validates req.body against the schema.
 * Returns 400 with detailed error messages on failure.
 */
const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      throw new ApiError(
        400,
        'Validation failed.',
        ERROR_CODES.VALIDATION_ERROR,
        errorMessages
      );
    }

    // Replace req.body with parsed (and coerced) data
    req.body = result.data;
    next();
  };
};

export default validate;
