const express = require("express");
const router = express.Router();
const {
  submitTest,
  getTestAttempt,
  listTestAttempts,
  reanalyzeTest,
} = require("../controllers/testController");
const { protect } = require("../middleware/authMiddleware");
const { testAnalysisLimiter } = require("../middleware/rateLimiter");

// All test routes require authentication
router.use(protect);

// Submit a completed MCQ test → scoring + AI analysis + auto revision-queue push
// (rate-limited: AI analysis runs on every submission)
router.post("/submit", testAnalysisLimiter, submitTest);

// History list (lightweight) and single-attempt detail (full AI analysis)
router.get("/", listTestAttempts);
router.get("/:id", getTestAttempt);

// Re-run AI analysis on an existing attempt (also rate-limited)
router.post("/:id/reanalyze", testAnalysisLimiter, reanalyzeTest);

module.exports = router;