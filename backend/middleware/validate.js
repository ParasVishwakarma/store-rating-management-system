const { body, validationResult } = require('express-validator');

const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;

const registerRules = [
  body('name')
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters.')
    .matches(passwordRegex)
    .withMessage('Password must contain at least one uppercase letter and one special character.'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required.')
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters.')
];

const loginRules = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required.')
];

const changePasswordRules = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required.'),
  body('newPassword')
    .isLength({ min: 8, max: 16 })
    .withMessage('New password must be between 8 and 16 characters.')
    .matches(passwordRegex)
    .withMessage('New password must contain at least one uppercase letter and one special character.')
];

const createUserRules = [
  body('name')
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters.')
    .matches(passwordRegex)
    .withMessage('Password must contain at least one uppercase letter and one special character.'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required.')
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters.'),
  body('role')
    .notEmpty()
    .withMessage('Role is required.')
    .isIn(['admin', 'user', 'store_owner'])
    .withMessage('Role must be admin, user, or store_owner.')
];

const createStoreRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Store name is required.')
    .isLength({ max: 60 })
    .withMessage('Store name must not exceed 60 characters.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required.')
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters.'),
  body('ownerId')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Owner ID must be a valid integer.')
];

const ratingRules = [
  body('storeId')
    .isInt({ min: 1 })
    .withMessage('Store ID must be a valid integer.'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5.')
];

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

module.exports = {
  registerRules,
  loginRules,
  changePasswordRules,
  createUserRules,
  createStoreRules,
  ratingRules,
  handleValidation
};
