const router   = require("express").Router();
const { protect , adminOnly } = require("../middleware/authMiddleware");

const {
  startSession,
  endSession,
  getTodaySessions,
  getAnalytics,
  getTimeline,
  updateSessionNotes,
  adminUserBreakdown,
  adminGlobalInsights,
} = require("../controllers/subjectSessionController");

router.post  ("/start",         protect, startSession);
router.patch ("/:id/end",       protect, endSession);
router.patch ("/:id/notes",     protect, updateSessionNotes);
router.get   ("/today",         protect, getTodaySessions);
router.get   ("/analytics",     protect, getAnalytics);
router.get   ("/timeline",      protect, getTimeline);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.get("/admin/users",  protect, adminOnly, adminUserBreakdown);
router.get("/admin/global", protect, adminOnly, adminGlobalInsights);

module.exports = router;