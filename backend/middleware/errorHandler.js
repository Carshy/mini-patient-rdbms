// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================
// Catches and formats errors throughout the application
// ============================================================================

const { errorResponse } = require('../utils/response');

/**
 * Global error handler middleware
 * Catches all errors and sends formatted responses
 */
function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err.message);
  
  // Log stack trace in development
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Default error
  let statusCode = 500;
  let message = 'Internal server error';
  let details = null;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    details = err.message;
  } else if (err.message.includes('does not exist')) {
    statusCode = 404;
    message = err.message;
  } else if (err.message.includes('Duplicate value')) {
    statusCode = 409; // Conflict
    message = err.message;
  } else if (err.message.includes('cannot be NULL')) {
    statusCode = 400;
    message = err.message;
  } else {
    message = err.message || message;
  }

  // Send error response
  return errorResponse(res, message, statusCode, details);
}

/**
 * 404 Not Found handler
 * Handles requests to non-existent routes
 */
function notFoundHandler(req, res) {
  return errorResponse(res, `Route ${req.originalUrl} not found`, 404);
}

module.exports = {
  errorHandler,
  notFoundHandler
};