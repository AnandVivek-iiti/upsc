const rateLimit = require("express-rate-limit");

// ─── Generic App-Wide Limiter ─────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests. Please try again after 5 minutes." },
  skipSuccessfulRequests: false,
});

// Free users: 10/day. Active Premium users: 40/day.
// `max` is computed per-request rather than a static number so premium status
// changes (grant, revoke, expiry) take effect immediately - no cache to bust.
const FREE_EVALUATE_MAX = 10;
const PREMIUM_EVALUATE_MAX = 40;

const evaluateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: (req) => {
    const premium = typeof req.user?.hasActivePremium === "function" && req.user.hasActivePremium();
    return premium ? PREMIUM_EVALUATE_MAX : FREE_EVALUATE_MAX;
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `user_${req.user.id}`,
  skip: (req) => req.user?.role === "admin",
  message: (req) => {
    const premium = typeof req.user?.hasActivePremium === "function" && req.user.hasActivePremium();
    const cap = premium ? PREMIUM_EVALUATE_MAX : FREE_EVALUATE_MAX;
    return {
      success: false,
      error: `Daily evaluation limit reached (${cap}/day). Resets at midnight.${
        premium ? "" : " Upgrade to Premium for a higher daily limit."
      } This limit protects AI API quotas.`,
    };
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
// Free users: 20/day. Active Premium users: 60/day.
const FREE_TEST_ANALYSIS_MAX = 20;
const PREMIUM_TEST_ANALYSIS_MAX = 60;

const testAnalysisLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: (req) => {
    const premium = typeof req.user?.hasActivePremium === "function" && req.user.hasActivePremium();
    return premium ? PREMIUM_TEST_ANALYSIS_MAX : FREE_TEST_ANALYSIS_MAX;
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `user_${req.user.id}`,
  skip: (req) => req.user?.role === "admin",
  message: (req) => {
    const premium = typeof req.user?.hasActivePremium === "function" && req.user.hasActivePremium();
    const cap = premium ? PREMIUM_TEST_ANALYSIS_MAX : FREE_TEST_ANALYSIS_MAX;
    return {
      success: false,
      error: `Daily test-analysis limit reached (${cap}/day). Resets at midnight.${
        premium ? "" : " Upgrade to Premium for a higher daily limit."
      } This limit protects AI API quotas.`,
    };
  },
});

module.exports = { globalLimiter, evaluateLimiter, authLimiter, testAnalysisLimiter };