const rateLimit = require("express-rate-limit");

// ─── Generic App-Wide Limiter ─────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests. Please try again after 15 minutes." },
  skipSuccessfulRequests: false,
});

// ─── AI Evaluate Limiter ──────────────────────────────────────────────────────
// Max 5 evaluations per user per 24 hours
// Note: this limiter sits behind the protect middleware, so req.user is always set.
// We key by user ID — no IP fallback needed, which avoids the IPv6 validation issue.
const evaluateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `user_${req.user.id}`,
  skip: (req) => req.user?.role === "admin",
  message: {
    success: false,
    error: "Daily evaluation limit reached (5/day). Resets at midnight. This limit protects AI API quotas.",
  },
});

// ─── Auth Route Limiter ───────────────────────────────────────────────────────
// Brute-force protection on login/register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many auth attempts. Please wait 15 minutes." },
});

// ─── Test Analysis Limiter ────────────────────────────────────────────────────
// Max 20 AI-analyzed test submissions per user per 24 hours.
// More generous than evaluateLimiter (Mains essays are far more expensive to
// grade than scoring+analyzing one MCQ test), but still capped to protect
// AI API quotas from runaway/automated submissions.
const testAnalysisLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `user_${req.user.id}`,
  skip: (req) => req.user?.role === "admin",
  message: {
    success: false,
    error: "Daily test-analysis limit reached (20/day). Resets at midnight. This limit protects AI API quotas.",
  },
});

module.exports = { globalLimiter, evaluateLimiter, authLimiter, testAnalysisLimiter };