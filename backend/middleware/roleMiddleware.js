// ============================================
// Role-Based Access Middleware
// ============================================
// Restricts routes to specific user roles.

/**
 * Creates middleware that restricts access to specified roles.
 * @param  {...string} allowedRoles - Roles that can access the route
 * @returns {Function} Express middleware
 *
 * Usage: roleMiddleware('admin') or roleMiddleware('admin', 'editor')
 */
function roleMiddleware(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        code: 401,
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to access this resource.',
        code: 403,
      });
    }

    next();
  };
}

module.exports = roleMiddleware;
