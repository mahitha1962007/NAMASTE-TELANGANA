// ============================================
// Error Handling Middleware
// ============================================

/**
 * Global error handler. Catches unhandled errors and returns
 * a consistent JSON error response.
 */
function errorMiddleware(err, req, res, next) {
  console.error('❌ Error:', err.message);
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    code: statusCode,
  });
}

/**
 * 404 handler for undefined routes.
 */
function notFoundMiddleware(req, res) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
    code: 404,
  });
}

module.exports = { errorMiddleware, notFoundMiddleware };
