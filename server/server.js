require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { connectDB } = require("./src/config/db");
const VisitorLog = require("./src/models/VisitorLog");

// ── Import all models so Sequelize registers them before sync ─────────────────
require("./src/models/User");
require("./src/models/Feature");
require("./src/models/UserData"); // registers UserData, SyllabusModule, Answer, DailyLog, SpacedRepItem

const { globalLimiter } = require("./src/middleware/rateLimiter");
const { errorHandler, notFound } = require("./src/middleware/errorMiddleware");

const authRoutes = require("./src/routes/authRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const evaluateRoutes = require("./src/routes/evaluateRoutes");
const adminRoutes = require("./src/routes/adminRoutes");

// ─── Connect Database ─────────────────────────────────────────────────────────
connectDB(); // connects + syncs all Sequelize models → creates tables

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "https://upsc-by-iitian.onrender.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS policy: origin ${origin} not allowed.`));
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// ─── Global Rate Limiter ──────────────────────────────────────────────────────
app.use(globalLimiter);

// ─── Visitor Analytics Tracker ────────────────────────────────────────────────
app.use((req, res, next) => {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown";
  const route = req.path;

  VisitorLog.recordHit(ip, route).catch((err) => {
    console.warn("VisitorLog warning:", err.message);
  });

  next();
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "UPSC-by-IITian API",
  });
});

// ─── Route Tables ─────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/evaluate", evaluateRoutes);
app.use("/api/admin", adminRoutes);

// ─── 404 & Error Handlers ─────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Lift ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🎯 UPSC Mentor API  →  http://localhost:${PORT}`);
  console.log(`   AI Model  : gemini-2.5-flash`);
  console.log(`   Database  : PostgreSQL`);
  console.log(`   Env       : ${process.env.NODE_ENV || "development"}\n`);
});