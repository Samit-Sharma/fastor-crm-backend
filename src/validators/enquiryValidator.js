const { body, param, query } = require("express-validator");

const publicEnquiryRules = [
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be 2 to 100 characters."),
  body("email").trim().isEmail().withMessage("Enter a valid email address.").normalizeEmail(),
  body("phone").optional({ values: "falsy" }).isString().isLength({ max: 20 }).withMessage("Phone must be at most 20 characters."),
  body("courseInterest").trim().isLength({ min: 2, max: 150 }).withMessage("Course interest must be 2 to 150 characters."),
  body("message").optional({ values: "falsy" }).isString().isLength({ max: 2000 }).withMessage("Message must be at most 2000 characters.")
];

const idRules = [
  param("id").isMongoId().withMessage("A valid enquiry ID is required.")
];

const paginationRules = [
  query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer."),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100.")
];

module.exports = { publicEnquiryRules, idRules, paginationRules };
