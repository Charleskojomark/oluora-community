const { body, param, query } = require('express-validator');

// Auth validation schemas
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Project validation schemas
const createProjectValidation = [
  body('title')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters')
    .trim(),
  body('description')
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters')
    .trim()
];

const updateProjectValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid project ID'),
  body('title')
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters')
    .trim(),
  body('description')
    .optional()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters')
    .trim(),
  body('status')
    .optional()
    .isIn(['PROPOSED', 'APPROVED', 'REJECTED'])
    .withMessage('Status must be one of: PROPOSED, APPROVED, REJECTED')
];

const voteValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid project ID'),
  body('vote_type')
    .isIn(['UPVOTE', 'DOWNVOTE'])
    .withMessage('Vote type must be either UPVOTE or DOWNVOTE')
];

// Townhall validation schemas
const createTownhallValidation = [
  body('title')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters')
    .trim(),
  body('description')
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters')
    .trim(),
  body('scheduled_at')
    .isISO8601()
    .withMessage('Scheduled date must be a valid ISO 8601 date')
    .custom((value) => {
      const scheduledDate = new Date(value);
      const now = new Date();
      if (scheduledDate <= now) {
        throw new Error('Scheduled date must be in the future');
      }
      return true;
    }),
  body('zoom_link')
    .optional()
    .isURL()
    .withMessage('Zoom link must be a valid URL')
];

const updateTownhallValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid townhall ID'),
  body('title')
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters')
    .trim(),
  body('description')
    .optional()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters')
    .trim(),
  body('scheduled_at')
    .optional()
    .isISO8601()
    .withMessage('Scheduled date must be a valid ISO 8601 date')
    .custom((value) => {
      if (value) {
        const scheduledDate = new Date(value);
        const now = new Date();
        if (scheduledDate <= now) {
          throw new Error('Scheduled date must be in the future');
        }
      }
      return true;
    }),
  body('zoom_link')
    .optional()
    .isURL()
    .withMessage('Zoom link must be a valid URL'),
  body('status')
    .optional()
    .isIn(['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED'])
    .withMessage('Status must be one of: SCHEDULED, LIVE, COMPLETED, CANCELLED')
];

// Common query validation schemas
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const getTownhallsValidation = [
  ...paginationValidation,
  query('status')
    .optional()
    .isIn(['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED'])
    .withMessage('Status must be one of: SCHEDULED, LIVE, COMPLETED, CANCELLED'),
  query('organizer')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Organizer must be a valid user ID'),
  query('from_date')
    .optional()
    .isISO8601()
    .withMessage('From date must be a valid ISO 8601 date'),
  query('to_date')
    .optional()
    .isISO8601()
    .withMessage('To date must be a valid ISO 8601 date')
];

const getProjectsValidation = [
  ...paginationValidation,
  query('status')
    .optional()
    .isIn(['PROPOSED', 'APPROVED', 'REJECTED'])
    .withMessage('Status must be one of: PROPOSED, APPROVED, REJECTED'),
  query('proposer')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Proposer must be a valid user ID')
];

// X Updates validation schemas
const getXUpdatesValidation = [
  ...paginationValidation,
  query('author')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Author must be between 1 and 100 characters')
    .trim(),
  query('from_date')
    .optional()
    .isISO8601()
    .withMessage('From date must be a valid ISO 8601 date'),
  query('to_date')
    .optional()
    .isISO8601()
    .withMessage('To date must be a valid ISO 8601 date')
];

// Parameter validation schemas
const idParamValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid ID parameter')
];

// Password reset validation schemas
const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Profile update validation schemas
const updateProfileValidation = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('first_name')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters')
    .trim(),
  body('last_name')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters')
    .trim(),
  body('phone')
    .optional()
    .matches(/^(\+234|0)[7-9][0-1]\d{8}$/)
    .withMessage('Please provide a valid Nigerian phone number')
];

// Change password validation
const changePasswordValidation = [
  body('current_password')
    .notEmpty()
    .withMessage('Current password is required'),
  body('new_password')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// User profile validation
const getUserProfileValidation = [
  param('id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Invalid user ID')
];

// Admin-only validations
const adminUpdateUserValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid user ID'),
  body('role')
    .optional()
    .isIn(['USER', 'ADMIN', 'MODERATOR'])
    .withMessage('Role must be one of: USER, ADMIN, MODERATOR'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value')
];

// Comment validation schemas (if you have comments feature)
const createCommentValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid project ID'),
  body('content')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
    .trim()
];

const updateCommentValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid comment ID'),
  body('content')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
    .trim()
];

// Custom validation middleware to handle date range validation
const validateDateRange = (req, res, next) => {
  const { from_date, to_date } = req.query;
  
  if (from_date && to_date) {
    const fromDate = new Date(from_date);
    const toDate = new Date(to_date);
    
    if (fromDate >= toDate) {
      return res.status(400).json({
        status: 'error',
        message: 'From date must be before to date'
      });
    }
  }
  
  next();
};

module.exports = {
  // Auth validations
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
  
  // Project validations
  createProjectValidation,
  updateProjectValidation,
  voteValidation,
  getProjectsValidation,
  
  // Townhall validations
  createTownhallValidation,
  updateTownhallValidation,
  getTownhallsValidation,
  
  // X Updates validations
  getXUpdatesValidation,
  
  // Profile validations
  updateProfileValidation,
  getUserProfileValidation,
  
  // Admin validations
  adminUpdateUserValidation,
  
  // Comment validations
  createCommentValidation,
  updateCommentValidation,
  
  // Common validations
  paginationValidation,
  idParamValidation,
  
  // Custom middleware
  validateDateRange
};