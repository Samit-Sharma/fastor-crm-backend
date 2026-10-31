const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173,http://localhost:5174,http://localhost:5175")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    // Allow requests without Origin (Postman, server-to-server) and configured frontend origins.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked this origin: ${origin}`));
  },
  methods: ["GET", "POST", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." }
});

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Welcome to the CRM API." });
});
app.use("/v1/pwa/user", authLimiter);

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "CRM API is healthy." });
});

app.use("/v1/pwa/user", authRoutes);
app.use("/v1/pwa/enquiry", enquiryRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
