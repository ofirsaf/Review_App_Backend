const { check, validationResult } = require("express-validator");

exports.userValidator = [
  check("name").trim().not().isEmpty().withMessage("Name is required"),
  check("email").normalizeEmail().isEmail().withMessage("Email is required"),
  check("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be between 8 and 20 characters"),
];

exports.validtePassword = [
  check("newPassword")
    .trim()
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be between 8 and 20 characters"),
];
exports.signInValidator = [
  check("email").normalizeEmail().isEmail().withMessage("Email is required"),
  check("password").trim().notEmpty().withMessage("Password is required"),
];
exports.runValidation = (req, res, next) => {
  const errors = validationResult(req).array();
  
  if (errors.length) {
    return res.json({ error: errors[0].msg });
  }
  next();
};
