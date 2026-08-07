require("dotenv").config();

const http = require("http");
const express = require("express");
const cors = require("cors");

const { connectDB } = require("./config/db");
const VisitorLog = require("./models/VisitorLog");

require("./models/User");
require("./models/UserData");
require("./models/Note");
require("./models/TestAttempt");
require("./models/UserEvents");
require("./models/DailyActiveUsers");
require("./models/Payment");
const { globalLimiter } = require("./middleware/rateLimiter");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const authRoutes      = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const evaluateRoutes  = require("./routes/evaluateRoutes");
const adminRoutes     = require("./routes/adminRoutes");
const testRoutes      = require("./routes/testRoutes");
const notesRoutes     = require("./routes/notesRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const subjectSessionRoutes = require("./routes/subjectSessionRoutes");
const paymentRoutes   = require("./routes/paymentRoutes");
const { webhook: razorpayWebhook } = require("./controllers/paymentController");
const { initSocket } = require("./socket/socketManager");

// ─── Build Express app ────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173,https://upsc-by-iitian.onrender.com,https://upsc-by-iitians.onrender.com,https://www.upscbyiitians.in")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

console.log("Configured allowed CORS origins:", allowedOrigins);

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

// ─── Security Headers (Google OAuth popup fix) ────────────────────────────────
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json", limit: "5mb" }),
  razorpayWebhook
);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "150mb" }));
app.use(express.urlencoded({ extended: true, limit: "150mb" }));

// ─── Global Rate Limiter ──────────────────────────────────────────────────────
app.use(globalLimiter);

// ─── Visitor Analytics Tracker ────────────────────────────────────────────────
app.use((req, res, next) => {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown";
  VisitorLog.recordHit(ip, req.path).catch((err) => {
    console.warn("VisitorLog warning:", err.message);
  });
  next();
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "UPSC-by-IITian API",
  });
});

// ─── Route Tables ─────────────────────────────────────────────────────────────
app.use("/api/auth",      authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/evaluate",  evaluateRoutes);
app.use("/api/admin",     adminRoutes);
app.use("/api/tests",     testRoutes);
app.use("/api/notes",     notesRoutes);
app.use("/api/feedback", feedbackRoutes);
 app.use("/api/subject-sessions",subjectSessionRoutes);
app.use("/api/payments",  paymentRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
// ─── 404 & Error Handlers ─────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

async function start() {
  try {

    await connectDB();

    const httpServer = http.createServer(app);
    initSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`\n🎯 UPSC Mentor API  →  http://localhost:${PORT}`);
      console.log(`   Database  : PostgreSQL`);
      console.log(`   Socket.io : enabled (real-time dashboard sync)`);
      console.log(`   Env       : ${process.env.NODE_ENV || "development"}\n`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
}

start();