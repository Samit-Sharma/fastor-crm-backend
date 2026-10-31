const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    email: {
      type: String,
      required: [true, "Student email is required"],
      lowercase: true,
      trim: true,
      maxlength: 254
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 20,
      default: ""
    },
    courseInterest: {
      type: String,
      required: [true, "Course interest is required"],
      trim: true,
      minlength: 2,
      maxlength: 150
    },
    message: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: ""
    },
    status: {
      type: String,
      enum: ["UNCLAIMED", "CLAIMED"],
      default: "UNCLAIMED",
      index: true
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
      index: true
    },
    claimedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Supports the public lead queue and an employee's private lead list.
enquirySchema.index({ status: 1, createdAt: -1 });
enquirySchema.index({ claimedBy: 1, createdAt: -1 });

module.exports = mongoose.model("Enquiry", enquirySchema);
