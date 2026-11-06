/** Operational error carrying an HTTP status; anything else is treated as a 500. */
class AppError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.details = details;
  }

  static badRequest(message, details) {
    return new AppError(400, message, details);
  }

  static notFound(message = 'Not found') {
    return new AppError(404, message);
  }
}

module.exports = AppError;
