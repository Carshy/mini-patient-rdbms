function successResponse(res, data, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

/**
 * Sends an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {*} details - Additional error details
 */
function errorResponse(res, message = 'An error occurred', statusCode = 500, details = null) {
  const response = {
    success: false,
    error: message
  };

  if (details) {
    response.details = details;
  }

  return res.status(statusCode).json(response);
}

/**
 * Sends a not found response
 * @param {Object} res - Express response object
 * @param {string} resource - Resource that was not found
 */
function notFoundResponse(res, resource = 'Resource') {
  return errorResponse(res, `${resource} not found`, 404);
}

/**
 * Sends a validation error response
 * @param {Object} res - Express response object
 * @param {Array|string} errors - Validation errors
 */
function validationErrorResponse(res, errors) {
  return errorResponse(res, 'Validation failed', 400, errors);
}

/**
 * Sends a created response (201)
 * @param {Object} res - Express response object
 * @param {*} data - Created resource data
 * @param {string} message - Success message
 */
function createdResponse(res, data, message = 'Resource created successfully') {
  return successResponse(res, data, message, 201);
}

/**
 * Sends a no content response (204)
 * @param {Object} res - Express response object
 */
function noContentResponse(res) {
  return res.status(204).send();
}

module.exports = {
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
  createdResponse,
  noContentResponse
};