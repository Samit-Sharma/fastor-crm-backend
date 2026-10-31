const mongoose = require("mongoose");
const Enquiry = require("../models/Enquiry");
const asyncHandler = require("../utils/asyncHandler");

function pagination(req) {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

// Public endpoint: no employee account or JWT is needed.
const createPublicEnquiry = asyncHandler(async (req, res) => {
  const { name, email, phone = "", courseInterest, message = "" } = req.body;

  const enquiry = await Enquiry.create({
    name,
    email: email.toLowerCase(),
    phone,
    courseInterest,
    message,
    status: "UNCLAIMED",
    claimedBy: null,
    claimedAt: null
  });

  return res.status(201).json({
    success: true,
    message: "Enquiry submitted successfully.",
    enquiry
  });
});

// Authenticated counselors all see the same unclaimed queue.
const getPublicEnquiries = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pagination(req);
  const filter = { status: "UNCLAIMED", claimedBy: null };

  const [enquiries, total] = await Promise.all([
    Enquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Enquiry.countDocuments(filter)
  ]);

  return res.status(200).json({
    success: true,
    message: "Unclaimed enquiries fetched successfully.",
    data: enquiries,
    pagination: {
      page, limit, total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total
    }
  });
});

// Atomic conditional update: only one concurrent request can change UNCLAIMED -> CLAIMED.
const claimEnquiry = asyncHandler(async (req, res) => {
  const employeeId = req.employee._id;

  const enquiry = await Enquiry.findOneAndUpdate(
    {
      _id: req.params.id,
      status: "UNCLAIMED",
      claimedBy: null
    },
    {
      $set: {
        status: "CLAIMED",
        claimedBy: employeeId,
        claimedAt: new Date()
      }
    },
    {
      new: true,
      runValidators: true
    }
  ).populate("claimedBy", "name email");

  if (!enquiry) {
    const exists = await Enquiry.exists({ _id: req.params.id });
    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found."
      });
    }
    return res.status(409).json({
      success: false,
      message: "This enquiry has already been claimed by another counselor."
    });
  }

  return res.status(200).json({
    success: true,
    message: "Enquiry claimed successfully.",
    enquiry
  });
});

// Employee ID is taken only from the verified JWT, never from request body/query.
const getMyLeads = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pagination(req);
  const filter = { status: "CLAIMED", claimedBy: req.employee._id };

  const [enquiries, total] = await Promise.all([
    Enquiry.find(filter).sort({ claimedAt: -1 }).skip(skip).limit(limit).lean(),
    Enquiry.countDocuments(filter)
  ]);

  return res.status(200).json({
    success: true,
    message: "Your claimed enquiries fetched successfully.",
    data: enquiries,
    pagination: {
      page, limit, total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total
    }
  });
});

module.exports = {
  createPublicEnquiry,
  getPublicEnquiries,
  claimEnquiry,
  getMyLeads
};
