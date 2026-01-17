const { errorResponse } = require('../utils/response');

function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err.message);
 
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  let statusCode = 500;
  let message = 'Internal server error';
  let details = null;

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    details = err.message;
  } else if (err.message.includes('does not exist')) {
    statusCode = 404;
    message = err.message;
  } else if (err.message.includes('Duplicate value')) {
    statusCode = 409; 
    message = err.message;
  } else if (err.message.includes('cannot be NULL')) {
    statusCode = 400;
    message = err.message;
  } else {
    message = err.message || message;
  }

  return errorResponse(res, message, statusCode, details);
}

function notFoundHandler(req, res) {
  return errorResponse(res, `Route ${req.originalUrl} not found`, 404);
}

module.exports = {
  errorHandler,
  notFoundHandler
};