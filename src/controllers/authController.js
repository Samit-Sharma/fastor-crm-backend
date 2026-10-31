const bcrypt = require("bcryptjs");
const Employee = require("../models/Employee");
const generateToken = require("../utils/token");
const asyncHandler = require("../utils/asyncHandler");

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingEmployee = await Employee.findOne({ email: email.toLowerCase() });
  if (existingEmployee) {
    return res.status(409).json({
      success: false,
      message: "An employee with this email is already registered."
    });
  }

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const employee = await Employee.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword
  });

  const token = generateToken(employee);
  return res.status(201).json({
    success: true,
    message: "Employee registered successfully.",
    token,
    employee: {
      id: employee._id,
      name: employee.name,
      email: employee.email
    }
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const employee = await Employee.findOne({ email: email.toLowerCase() }).select("+password");
  if (!employee || !(await bcrypt.compare(password, employee.password))) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password."
    });
  }

  const token = generateToken(employee);
  return res.status(200).json({
    success: true,
    message: "Login successful.",
    token,
    employee: {
      id: employee._id,
      name: employee.name,
      email: employee.email
    }
  });
});

module.exports = { register, login };
