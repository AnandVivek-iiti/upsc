const router   = require("express").Router();
const { protect } = require("../middleware/authMiddleware"); // ← FIX: was missing entirely

const {
  startSession,
  endSession,
  getTodaySessions,
  getAnalytics,
  getTimeline,
  syncSyllabus,
  adminUserBreakdown,
  adminGlobalInsights,
} = require("../controllers/subjectSessionController");

router.post  ("/start",         protect, startSession);     // Feature 1  - open session
router.patch ("/:id/end",       protect, endSession);       // Feature 2  - close session
router.get   ("/today",         protect, getTodaySessions); // Feature 6  - today's history + timeline
router.get   ("/analytics",     protect, getAnalytics);     // Features 3 & 4 - distribution + insights
router.get   ("/timeline",      protect, getTimeline);      // Feature 8  - full event log (paginated)
router.post  ("/sync-syllabus", protect, syncSyllabus);     // Feature 5  - manual syllabus sync

// ── Admin routes ──────────────────────────────────────────────────────────────
router.get   ("/admin/users",   protect, adminUserBreakdown);  // Feature 7 - per-user breakdown
router.get   ("/admin/global",  protect, adminGlobalInsights); // Feature 9 - founder insights

module.exports = router;