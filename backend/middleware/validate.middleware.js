const { body, validationResult } = require("express-validator");
const { ROLES } = require("../config/constants");


const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

exports.validateRegister = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 50 }).withMessage("Name must be 2–50 characters"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Must be a valid email"),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/).withMessage("Password must contain at least one number"),

  validate
];

exports.validateLogin = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Must be a valid email"),

  body("password")
    .notEmpty().withMessage("Password is required"),

  validate
];

const VALID_CATEGORIES = ["Travel", "Meals", "Office Supplies", "Software", "Training", "Other"];

exports.validateCreateExpense = [
  body("amount")
    .notEmpty().withMessage("Amount is required")
    .isFloat({ gt: 0 }).withMessage("Amount must be greater than 0")
    .isFloat({ max: 100000 }).withMessage("Amount cannot exceed 100,000"),

  body("category")
    .notEmpty().withMessage("Category is required")
    .isIn(VALID_CATEGORIES).withMessage(`Category must be one of: ${VALID_CATEGORIES.join(", ")}`),

  body("notes")
    .optional()
    .isLength({ max: 500 }).withMessage("Notes cannot exceed 500 characters"),

  validate
];

exports.validateEditExpense = [
  body("amount")
    .optional()
    .isFloat({ gt: 0 }).withMessage("Amount must be greater than 0")
    .isFloat({ max: 100000 }).withMessage("Amount cannot exceed 100,000"),

  body("category")
    .optional()
    .isIn(VALID_CATEGORIES).withMessage(`Category must be one of: ${VALID_CATEGORIES.join(", ")}`),

  body("notes")
    .optional()
    .isLength({ max: 500 }).withMessage("Notes cannot exceed 500 characters"),

  validate
];


exports.validateUpdateRole = [
  body("role")
    .notEmpty().withMessage("Role is required")
    .isIn(Object.values(ROLES)).withMessage(`Role must be one of: ${Object.values(ROLES).join(", ")}`),

  validate
];

exports.validateAssignManager = [
  body("managerId")
    .notEmpty().withMessage("managerId is required")
    .isMongoId().withMessage("managerId must be a valid ID"),

  validate
];

exports.validateRejection = [
  body("reason")
    .optional()
    .isLength({ max: 300 }).withMessage("Reason cannot exceed 300 characters"),

  validate
];