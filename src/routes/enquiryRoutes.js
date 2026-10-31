const express = require("express");
const {
  createPublicEnquiry,
  getPublicEnquiries,
  claimEnquiry,
  getMyLeads
} = require("../controllers/enquiryController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  publicEnquiryRules,
  idRules,
  paginationRules
} = require("../validators/enquiryValidator");

const router = express.Router();

// Public form submission: intentionally registered before protected routes.
router.post("/public", publicEnquiryRules, validate, createPublicEnquiry);

// All routes below require a valid employee JWT.
router.get("/public", protect, paginationRules, validate, getPublicEnquiries);
router.get("/my-leads", protect, paginationRules, validate, getMyLeads);
router.patch("/:id/claim", protect, idRules, validate, claimEnquiry);

module.exports = router;
