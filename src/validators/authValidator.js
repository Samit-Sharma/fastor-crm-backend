const { body } = require("express-validator");

const registerRules = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 80 }).withMessage("Name must be 2 to 80 characters."),
  body("email")
    .trim()
    .isEmail().withMessage("Enter a valid email address.")
    .normalizeEmail(),
  body("password")
    .isString()
    .isLength({ min: 8, max: 72 }).withMessage("Password must be 8 to 72 characters.")
];

const loginRules = [
  body("email").trim().isEmail().withMessage("Enter a valid email address.").normalizeEmail(),
  body("password").isString().notEmpty().withMessage("Password is required.")
];

module.exports = { registerRules, loginRules };
