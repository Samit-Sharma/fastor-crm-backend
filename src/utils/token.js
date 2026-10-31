const jwt = require("jsonwebtoken");

function generateToken(employee) {
  return jwt.sign(
    { employeeId: employee._id.toString(), email: employee.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d", issuer: "fastor-crm-api" }
  );
}

module.exports = generateToken;
