function errorBody (status, message, success) {
    this.status=status
    this.message=message
    this.success= success
}

exports.errorHandler = {
  400: new errorBody(400, 'Bad request', false),
  401: new errorBody(401, 'Token Expired.', false),
  404: new errorBody(404, 'Something went wrong', false),
  500: new errorBody(500, 'Internal server error', false),
  503: new errorBody(503, 'Internal server error', false),
  402: new errorBody(402, 'Something is wrong with your account, Contact Admin', false),
};
