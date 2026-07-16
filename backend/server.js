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

console.log("App router stack:");
// Removed premature route inspection that runs before app is initialized
// ((app._router && app._router.stack) || []).forEach((layer, i) => {
//   try {
//     console.log(
//       "Layer",
//       i,
//       "name=",
//       layer.name,
//       "regexp=",
//       layer.regexp && layer.regexp.toString(),
//     );
//     if (layer.route) {
//       console.log(
//         "  Route path=",
//         layer.route.path,
//         "methods=",
//         Object.keys(layer.route.methods || {}),
//       );
//     }
//     if (
//       layer.name === "router" &&
//       layer.handle &&
//       Array.isArray(layer.handle.stack)
//     ) {
//       layer.handle.stack.forEach((l) => {
//         if (l && l.route) {
//           console.log(
//             "   Subroute path=",
//             l.route.path,
//             "methods=",
//             Object.keys(l.route.methods || {}),
//           );
//         }
//       });
//     }
//   } catch (e) {
//     console.warn("  Error inspecting layer", i, e.message);
//   }
// });

const app = express();

// Security Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: false, // Allow loading files from server in browser if needed
  }),
);

// CORS Configuration - restrict to known frontends in production
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow Postman, curl, server-to-server requests
      if (!origin) return callback(null, true);

      // Allow localhost
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow every Vercel deployment
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      return callback(new Error(`CORS Not Allowed: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight requests
app.options("*", cors());

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

// Quick test endpoint to validate POST reachability
app.post("/api/chat-public-test", (req, res) => {
  res.json({ success: true, message: "chat-public-test reachable" });
});

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
    console.log("App router stack:");
    app._router.stack.forEach((layer, i) => {
      const info = { index: i, name: layer.name };
      if (layer.route) {
        info.route = layer.route.path;
        info.methods = layer.route.methods;
      } else if (
        layer.name === "router" &&
        layer.handle &&
        layer.handle.stack
      ) {
        info.router = layer.handle.stack.map((h) => ({
          path: h.route?.path,
          methods: h.route?.methods,
        }));
      }
      console.log(JSON.stringify(info));
    });
  } catch (e) {
    console.warn("Could not inspect router stack:", e.message);
  }
});
