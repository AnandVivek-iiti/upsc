require("dotenv").config();

const http = require("http");
const express = require("express");
const cors = require("cors");

const { connectDB } = require("./config/db");
const VisitorLog = require("./models/VisitorLog");

// ── Import all models so Sequelize registers them before sync ─────────────────
require(".//models/User");
require(".//models/Feature");
require(".//models/UserData"); // registers UserData, SyllabusModule, Answer, DailyLog, SpacedRepItem
require(".//models/TestAttempt"); // registers TestAttempt (MCQ Test Series results) so its table gets created on sync

const { globalLimiter } = require(".//middleware/rateLimiter");
const { errorHandler, notFound } = require(".//middleware/errorMiddleware");

const authRoutes = require(".//routes/authRoutes");
const dashboardRoutes = require(".//routes/dashboardRoutes");
const evaluateRoutes = require(".//routes/evaluateRoutes");
const adminRoutes = require(".//routes/adminRoutes");
const testRoutes = require(".//routes/testRoutes");
const notesRoutes = require(".//routes/notesRoutes");

// ── Socket.io — real-time dashboard sync (timer/progress across tabs+devices) ─
const { initSocket } = require(".//socket/socketManager");

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
app.use("/api/tests", testRoutes);
app.use("/api/notes", notesRoutes);

// ─── 404 & Error Handlers ─────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── HTTP Server + Socket.io ──────────────────────────────────────────────────
// Socket.io needs to attach to the raw http.Server, not the Express app
// directly — that's why we wrap app in http.createServer() and pass THAT to
// both initSocket() and .listen(), instead of calling app.listen() like before.
const httpServer = http.createServer(app);
initSocket(httpServer);

// ─── Lift ─────────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`\n🎯 UPSC Mentor API  →  http://localhost:${PORT}`);
  console.log(`   Database  : PostgreSQL`);
  console.log(`   Socket.io : enabled (real-time dashboard sync)`);
  console.log(`   Env       : ${process.env.NODE_ENV || "development"}\n`);
});