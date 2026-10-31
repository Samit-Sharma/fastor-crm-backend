require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing. Create a .env file using .env.example.");
    }
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error("JWT_SECRET must be set and contain at least 32 characters.");
    }

    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`CRM API running at http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });

    const shutdown = (signal) => {
      console.log(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        const mongoose = require("mongoose");
        mongoose.connection.close(false).finally(() => process.exit(0));
      });
    };
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Unable to start server:", error.message);
    process.exit(1);
  }
}

startServer();
