function successResponse(res, data, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

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

function notFoundResponse(res, resource = 'Resource') {
  return errorResponse(res, `${resource} not found`, 404);
}

function validationErrorResponse(res, errors) {
  return errorResponse(res, 'Validation failed', 400, errors);
}

function createdResponse(res, data, message = 'Resource created successfully') {
  return successResponse(res, data, message, 201);
}

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