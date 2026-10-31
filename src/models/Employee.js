const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 80
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      index: true
    },
    password: {
      type: String,
      required: true,
      select: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
