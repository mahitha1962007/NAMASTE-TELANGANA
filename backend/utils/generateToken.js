// ============================================
// JWT Token Generator
// ============================================

const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for a user.
 * @param {Object} user - User object with id, role, email, name
 * @returns {string} Signed JWT token
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    process.env.JWT_SECRET || 'default_secret_change_me',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

module.exports = generateToken;
