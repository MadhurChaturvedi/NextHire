require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const connectDB = require("./config/db");
const seedRoles = require("./config/seed");

// Import routes
const authRoutes = require("./routes/authRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const careerRoleRoutes = require("./routes/careerRoleRoutes");
const chatRoutes = require("./routes/chatRoutes");

// Connect to MongoDB Database
connectDB().then(() => {
  // Pre-populate CareerRoles if empty
  seedRoles();
});

const app = express();

// Security Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: false, // Allow loading files from server in browser if needed
  }),
);

// CORS Configuration
app.use(
  cors({
    origin: "*", // Allow all origins for local development/testing
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rate Limiter configuration (100 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message:
      "Too many requests from this IP, please try again after 15 minutes.",
  },
});
app.use("/api/", limiter);

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/career-roles", careerRoleRoutes);
app.use("/api/chat", chatRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "NextHire backend server is healthy and running.",
  });
});

// Root endpoint redirection
app.get("/", (req, res) => {
  res.send("NextHire MERN Backend is running.");
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
  // Debug: list registered routes
  try {
    const routes = [];
    app._router.stack.forEach((middleware) => {
      if (middleware.route) {
        // routes registered directly on the app
        routes.push(middleware.route.path);
      } else if (middleware.name === "router") {
        middleware.handle.stack.forEach(function (handler) {
          const route = handler.route;
          route && routes.push(route.path);
        });
      }
    });
    console.log("Registered routes:", routes);
  } catch (e) {
    console.warn("Could not list routes:", e.message);
  }
});
