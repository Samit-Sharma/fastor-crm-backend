const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Send Authorization: Bearer <token>."
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "fastor-crm-api"
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.name === "TokenExpiredError"
        ? "Your session has expired. Please log in again."
        : "Invalid authentication token."
    });
  }

  const employee = await Employee.findById(decoded.employeeId).select("_id name email");
  if (!employee) {
    return res.status(401).json({
      success: false,
      message: "The employee associated with this token no longer exists."
    });
  }

  req.employee = employee;
  next();
});

module.exports = { protect };
