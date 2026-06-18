// ============================================
// Authentication Middleware
// ============================================
// Validates JWT token and attaches user data to request.

const jwt = require('jsonwebtoken');

/**
 * Middleware that verifies the JWT from the Authorization header.
 * Attaches decoded user payload (id, role, email, name) to req.user.
 */
function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        code: 401,
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_change_me');

    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.',
        code: 401,
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token.',
      code: 401,
    });
  }
}

module.exports = authMiddleware;
