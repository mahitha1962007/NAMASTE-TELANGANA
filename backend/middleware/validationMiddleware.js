// ============================================
// Input Validation Middleware
// ============================================
// Uses express-validator for request validation.

const { body, validationResult } = require('express-validator');

/**
 * Process validation results and return errors if any.
 */
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      code: 400,
    });
  }
  next();
}

// Login validation rules
const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
  handleValidation,
];

// Register / Create staff validation rules
const validateCreateUser = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('role').isIn(['admin', 'reporter', 'interviewer', 'photographer', 'editor', 'video_editor', 'social_media_manager', 'publication_manager']).withMessage('Invalid role.'),
  handleValidation,
];

// Update staff validation rules
const validateUpdateUser = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty.'),
  body('email').optional().isEmail().withMessage('Valid email is required.'),
  body('role').optional().isIn(['admin', 'reporter', 'interviewer', 'photographer', 'editor', 'video_editor', 'social_media_manager', 'publication_manager']).withMessage('Invalid role.'),
  handleValidation,
];

// Assignment validation rules
const validateAssignment = [
  body('title').trim().notEmpty().withMessage('Story title is required.'),
  body('publication_deadline').notEmpty().withMessage('Publication deadline is required.'),
  handleValidation,
];

// Status update validation
const validateStatus = [
  body('status').isIn(['Assigned', 'In Progress', 'Completed', 'Delayed', 'Archived']).withMessage('Invalid status value.'),
  handleValidation,
];

// Note validation
const validateNote = [
  body('note').trim().notEmpty().withMessage('Note content is required.'),
  handleValidation,
];

module.exports = {
  handleValidation,
  validateLogin,
  validateCreateUser,
  validateUpdateUser,
  validateAssignment,
  validateStatus,
  validateNote,
};
