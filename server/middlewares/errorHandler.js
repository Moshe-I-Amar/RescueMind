const AppError = require('../utils/AppError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ status: 'error', message: err.message, details: err.details });
  }
  if (err.name === 'CastError') {
    return res.status(404).json({ status: 'error', message: 'Not found' });
  }
  console.error('Unhandled error:', err);
  return res.status(500).json({ status: 'error', message: 'Server error' });
}

module.exports = errorHandler;
