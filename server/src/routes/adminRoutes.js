const express = require("express");
const router = express.Router();
const {
  getMetrics,
  listUsers,
  getFunnel,
  getFeatureAnalytics,
  getActivity,
  getRetention,
  recordEvent,
  deleteUser,
  getJourney,
  getUserSessions,
  getSegments,
  getDiscovery,
  getInsights,
} = require("../controllers/adminController");

// ← NEW: email controller
const { getEmailTargets, sendPowerUserEmails, sendSingleUserEmail } = require("../controllers/emailController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.use(protect, adminOnly);

router.get("/metrics", getMetrics);
router.get("/users", listUsers);
router.get("/funnel", getFunnel);
router.get("/features", getFeatureAnalytics);
router.get("/activity", getActivity);
router.get("/retention", getRetention);
router.post("/events", recordEvent);
router.delete("/users/:id", deleteUser);
router.get("/journey", getJourney);
router.get("/sessions/:userId", getUserSessions);
router.get("/segments", getSegments);
router.get("/discovery", getDiscovery);
router.get("/insights", getInsights);


router.get("/email/power-users", getEmailTargets);
router.post("/email/power-users", sendPowerUserEmails);
router.post("/email/send-single", sendSingleUserEmail);

module.exports = router;